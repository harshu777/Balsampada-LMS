import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto, ApprovePaymentDto, RejectPaymentDto, PaymentFilterDto } from './dto';
import { PaymentStatus, PaymentType, Role } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
    paidByUserId: string,
    proofFile?: Express.Multer.File,
  ) {
    try {
      // Validate student exists and is active
      const student = await this.prisma.user.findUnique({
        where: { id: createPaymentDto.studentId },
      });

      if (!student || student.role !== Role.STUDENT) {
        throw new BadRequestException('Invalid student ID');
      }

      // Generate receipt number
      const receiptNumber = await this.generateReceiptNumber();

      // Prepare payment data
      const paymentData = {
        ...createPaymentDto,
        paidBy: paidByUserId,
        receiptNumber,
        proofFileUrl: proofFile ? `/uploads/payment-proofs/${proofFile.filename}` : null,
        proofFileName: proofFile ? proofFile.originalname : null,
        dueDate: createPaymentDto.dueDate ? new Date(createPaymentDto.dueDate) : null,
      };

      const payment = await this.prisma.payment.create({
        data: paymentData,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          paidByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          enrollment: {
            include: {
              subject: {
                include: {
                  class: true,
                },
              },
            },
          },
        },
      });

      // Create notification for admin
      await this.createPaymentNotification(payment.id, 'PAYMENT_SUBMITTED');

      return payment;
    } catch (error) {
      // Clean up uploaded file if payment creation fails
      if (proofFile) {
        try {
          fs.unlinkSync(proofFile.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
      throw error;
    }
  }

  async getPayments(filters: PaymentFilterDto, userRole: Role, userId?: string) {
    const page = parseInt(filters.page || '1') || 1;
    const limit = parseInt(filters.limit || '10') || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Apply role-based filtering
    if (userRole === Role.STUDENT) {
      where.studentId = userId;
    } else if (filters.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.monthYear) {
      where.monthYear = filters.monthYear;
    }

    if (filters.academicYear) {
      where.academicYear = filters.academicYear;
    }

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          paidByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          approvedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          enrollment: {
            include: {
              subject: {
                include: {
                  class: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPaymentById(id: string, userRole: Role, userId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        paidByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        enrollment: {
          include: {
            subject: {
              include: {
                class: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check access permissions
    if (userRole === Role.STUDENT && payment.studentId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return payment;
  }

  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto) {
    const existingPayment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      throw new NotFoundException('Payment not found');
    }

    if (existingPayment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be updated');
    }

    return this.prisma.payment.update({
      where: { id },
      data: {
        ...updatePaymentDto,
        dueDate: updatePaymentDto.dueDate ? new Date(updatePaymentDto.dueDate) : undefined,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        paidByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async approvePayment(id: string, approvePaymentDto: ApprovePaymentDto, approvedByUserId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be approved');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.APPROVED,
        approvedBy: approvedByUserId,
        approvalDate: new Date(),
        notes: approvePaymentDto.notes || payment.notes,
        receiptNumber: approvePaymentDto.receiptNumber || payment.receiptNumber,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update enrollment payment status if applicable
    if (payment.enrollmentId && payment.type === PaymentType.ENROLLMENT_FEE) {
      await this.prisma.studentEnrollment.update({
        where: { id: payment.enrollmentId },
        data: { 
          paymentStatus: PaymentStatus.APPROVED,
          isActive: true,
        },
      });
    }

    // Create notification for student
    await this.createPaymentNotification(payment.id, 'PAYMENT_APPROVED');

    return updatedPayment;
  }

  async rejectPayment(id: string, rejectPaymentDto: RejectPaymentDto, rejectedByUserId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be rejected');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.REJECTED,
        approvedBy: rejectedByUserId,
        approvalDate: new Date(),
        rejectionReason: rejectPaymentDto.rejectionReason,
        notes: rejectPaymentDto.notes || payment.notes,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create notification for student
    await this.createPaymentNotification(payment.id, 'PAYMENT_REJECTED');

    return updatedPayment;
  }

  async getPaymentStatistics(filters?: { academicYear?: string; monthYear?: string }) {
    const where: any = {};
    
    if (filters?.academicYear) {
      where.academicYear = filters.academicYear;
    }
    
    if (filters?.monthYear) {
      where.monthYear = filters.monthYear;
    }

    const [
      totalPayments,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      totalAmount,
      approvedAmount,
    ] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.PENDING } }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.APPROVED } }),
      this.prisma.payment.count({ where: { ...where, status: PaymentStatus.REJECTED } }),
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.APPROVED },
        _sum: { amount: true },
      }),
    ]);

    // Monthly collection statistics
    const monthlyStats = await this.prisma.payment.groupBy({
      by: ['monthYear'],
      where: {
        ...where,
        status: PaymentStatus.APPROVED,
        monthYear: { not: null },
      },
      _sum: { amount: true },
      _count: true,
      orderBy: { monthYear: 'desc' },
      take: 12,
    });

    return {
      overview: {
        totalPayments,
        pendingPayments,
        approvedPayments,
        rejectedPayments,
        totalAmount: totalAmount._sum.amount || 0,
        approvedAmount: approvedAmount._sum.amount || 0,
      },
      monthlyStats,
    };
  }

  async getOverduePayments() {
    const currentDate = new Date();
    
    return this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDING,
        dueDate: {
          lt: currentDate,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async deletePayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.APPROVED) {
      throw new BadRequestException('Cannot delete approved payments');
    }

    // Delete proof file if exists
    if (payment.proofFileUrl) {
      try {
        const filePath = path.join(process.cwd(), payment.proofFileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    return this.prisma.payment.delete({
      where: { id },
    });
  }

  private async generateReceiptNumber(): Promise<string> {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    
    // Get the count of payments for this month
    const monthStart = new Date(year, currentDate.getMonth(), 1);
    const monthEnd = new Date(year, currentDate.getMonth() + 1, 0);
    
    const count = await this.prisma.payment.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `RCP${year}${month}${sequence}`;
  }

  private async createPaymentNotification(paymentId: string, type: 'PAYMENT_SUBMITTED' | 'PAYMENT_APPROVED' | 'PAYMENT_REJECTED') {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: true,
      },
    });

    if (!payment) return;

    let title: string;
    let message: string;
    let recipients: string[] = [];

    switch (type) {
      case 'PAYMENT_SUBMITTED':
        title = 'New Payment Submitted';
        message = `Payment of ₹${payment.amount} submitted by ${payment.student.firstName} ${payment.student.lastName}`;
        // Get all admin users
        const admins = await this.prisma.user.findMany({
          where: { role: Role.ADMIN },
          select: { id: true },
        });
        recipients = admins.map(admin => admin.id);
        break;

      case 'PAYMENT_APPROVED':
        title = 'Payment Approved';
        message = `Your payment of ₹${payment.amount} has been approved. Receipt: ${payment.receiptNumber}`;
        recipients = [payment.studentId];
        break;

      case 'PAYMENT_REJECTED':
        title = 'Payment Rejected';
        message = `Your payment of ₹${payment.amount} has been rejected. Reason: ${payment.rejectionReason}`;
        recipients = [payment.studentId];
        break;
    }

    // Create notifications for all recipients
    const notifications = recipients.map(userId => ({
      userId,
      type: 'PAYMENT' as const,
      title,
      message,
      data: { paymentId },
    }));

    if (notifications.length > 0) {
      // Create database notifications
      await this.prisma.notification.createMany({
        data: notifications,
      });

      // Send real-time notifications
      for (const recipient of recipients) {
        await this.notificationsGateway.sendPaymentNotification(recipient, {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          type: payment.type,
          rejectionReason: payment.rejectionReason || undefined,
        });
      }
    }
  }
}