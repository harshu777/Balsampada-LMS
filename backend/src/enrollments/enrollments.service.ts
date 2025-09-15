import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    // Check if student exists and has STUDENT role
    const student = await this.prisma.user.findUnique({
      where: { id: createEnrollmentDto.studentId, role: 'STUDENT' },
    });

    if (!student) {
      throw new BadRequestException('Student not found or user is not a student');
    }

    // Check if subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: createEnrollmentDto.subjectId },
      include: { class: true },
    });

    if (!subject) {
      throw new BadRequestException('Subject not found');
    }

    try {
      const enrollment = await this.prisma.studentEnrollment.create({
        data: {
          ...createEnrollmentDto,
          enrollmentDate: createEnrollmentDto.enrollmentDate
            ? new Date(createEnrollmentDto.enrollmentDate)
            : new Date(),
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
          subject: {
            include: {
              class: true,
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      return enrollment;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Student is already enrolled in this subject');
      }
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    subjectId?: string,
    studentId?: string,
    isActive?: boolean,
    paymentStatus?: PaymentStatus,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        {
          student: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          subject: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }
    if (subjectId) {
      where.subjectId = subjectId;
    }
    if (studentId) {
      where.studentId = studentId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    const [enrollments, total] = await Promise.all([
      this.prisma.studentEnrollment.findMany({
        where,
        skip,
        take: limit,
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
          subject: {
            include: {
              class: true,
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.studentEnrollment.count({ where }),
    ]);

    return {
      enrollments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const enrollment = await this.prisma.studentEnrollment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        subject: {
          include: {
            class: true,
            teachers: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          include: {
            paidByUser: {
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
                email: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  async updateStatus(id: string, isActive: boolean, paymentStatus?: PaymentStatus) {
    try {
      const updateData: any = { isActive };
      if (paymentStatus !== undefined) {
        updateData.paymentStatus = paymentStatus;
      }

      const updatedEnrollment = await this.prisma.studentEnrollment.update({
        where: { id },
        data: updateData,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          subject: {
            include: {
              class: true,
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      return updatedEnrollment;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Enrollment not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Check if enrollment has any payments
      const enrollmentWithPayments = await this.prisma.studentEnrollment.findUnique({
        where: { id },
        include: {
          payments: true,
        },
      });

      if (!enrollmentWithPayments) {
        throw new NotFoundException('Enrollment not found');
      }

      if (enrollmentWithPayments.payments.length > 0) {
        throw new ConflictException(
          'Cannot delete enrollment with payment records. Please deactivate instead.'
        );
      }

      await this.prisma.studentEnrollment.delete({
        where: { id },
      });

      return { message: 'Enrollment deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Enrollment not found');
      }
      throw error;
    }
  }

  async findByStudent(studentId: string, page = 1, limit = 10, isActive?: boolean) {
    const skip = (page - 1) * limit;
    
    const where: any = { studentId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [enrollments, total] = await Promise.all([
      this.prisma.studentEnrollment.findMany({
        where,
        skip,
        take: limit,
        include: {
          subject: {
            include: {
              class: true,
              teachers: {
                include: {
                  teacher: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
              materials: {
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
                take: 5,
              },
              assignments: {
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
                take: 5,
              },
              tests: {
                where: { isActive: true },
                orderBy: { startTime: 'desc' },
                take: 5,
              },
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.studentEnrollment.count({ where }),
    ]);

    return {
      enrollments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySubject(subjectId: string, page = 1, limit = 10, isActive?: boolean) {
    const skip = (page - 1) * limit;
    
    const where: any = { subjectId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [enrollments, total] = await Promise.all([
      this.prisma.studentEnrollment.findMany({
        where,
        skip,
        take: limit,
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
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.studentEnrollment.count({ where }),
    ]);

    return {
      enrollments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEnrollmentStats() {
    const [
      totalEnrollments,
      activeEnrollments,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      enrollmentsByMonth,
    ] = await Promise.all([
      this.prisma.studentEnrollment.count(),
      this.prisma.studentEnrollment.count({ where: { isActive: true } }),
      this.prisma.studentEnrollment.count({ where: { paymentStatus: 'PENDING' } }),
      this.prisma.studentEnrollment.count({ where: { paymentStatus: 'APPROVED' } }),
      this.prisma.studentEnrollment.count({ where: { paymentStatus: 'REJECTED' } }),
      this.prisma.studentEnrollment.groupBy({
        by: ['enrollmentDate'],
        _count: {
          id: true,
        },
        orderBy: {
          enrollmentDate: 'desc',
        },
        take: 12,
      }),
    ]);

    return {
      totalEnrollments,
      activeEnrollments,
      inactiveEnrollments: totalEnrollments - activeEnrollments,
      paymentStats: {
        pending: pendingPayments,
        approved: approvedPayments,
        rejected: rejectedPayments,
      },
      enrollmentTrend: enrollmentsByMonth,
    };
  }

  async bulkUpdateStatus(enrollmentIds: string[], isActive: boolean, paymentStatus?: PaymentStatus) {
    const updateData: any = { isActive };
    if (paymentStatus !== undefined) {
      updateData.paymentStatus = paymentStatus;
    }

    const updatedEnrollments = await this.prisma.studentEnrollment.updateMany({
      where: {
        id: {
          in: enrollmentIds,
        },
      },
      data: updateData,
    });

    return {
      message: `Successfully updated ${updatedEnrollments.count} enrollments`,
      updatedCount: updatedEnrollments.count,
    };
  }
}