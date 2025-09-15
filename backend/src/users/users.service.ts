import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { Role, UserStatus, DocumentStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async getStudents(status?: UserStatus) {
    const where = {
      role: Role.STUDENT,
      ...(status && { status }),
    };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        documents: {
          select: {
            id: true,
            type: true,
            fileUrl: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTeachers(status?: UserStatus) {
    const where = {
      role: Role.TEACHER,
      ...(status && { status }),
    };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        documents: {
          select: {
            id: true,
            type: true,
            fileUrl: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        documents: {
          select: {
            id: true,
            type: true,
            fileUrl: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            reviewNotes: true,
          },
        },
        studentPayments: {
          select: {
            id: true,
            amount: true,
            status: true,
            dueDate: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserStatus(id: string, status: UserStatus, remarks?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Cannot change admin status');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { 
        status,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    // If user has documents and status is changing, update document status
    if (remarks || status === UserStatus.APPROVED || status === UserStatus.REJECTED) {
      await this.prisma.document.updateMany({
        where: { userId: id },
        data: {
          ...(status === UserStatus.APPROVED && { 
            status: DocumentStatus.APPROVED,
            updatedAt: new Date(),
          }),
          ...(status === UserStatus.REJECTED && { 
            status: DocumentStatus.REJECTED,
          }),
          ...(remarks && { reviewNotes: remarks }),
        },
      });
    }

    // Send email notification for approval/rejection
    if (status === UserStatus.APPROVED || status === UserStatus.REJECTED) {
      try {
        const fullName = `${updatedUser.firstName} ${updatedUser.lastName}`;
        await this.emailService.sendApprovalEmail(
          updatedUser.email,
          fullName,
          status,
          remarks
        );
        console.log(`✅ ${status} email sent to ${updatedUser.email}`);
      } catch (error) {
        console.error(`Failed to send ${status} email to ${updatedUser.email}:`, error);
        // Don't throw error - email failure shouldn't block the status update
      }
    }

    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Cannot delete admin user');
    }

    // Delete related records first (cascade delete)
    await this.prisma.$transaction([
      // Delete documents
      this.prisma.document.deleteMany({ where: { userId: id } }),
      // Delete payments
      this.prisma.payment.deleteMany({ where: { studentId: id } }),
      // Delete attendance
      this.prisma.attendance.deleteMany({ where: { studentId: id } }),
      // Delete messages sent
      this.prisma.message.deleteMany({ where: { senderId: id } }),
      // Delete messages received
      this.prisma.message.deleteMany({ where: { receiverId: id } }),
      // Delete notifications
      this.prisma.notification.deleteMany({ where: { userId: id } }),
      // Finally delete the user
      this.prisma.user.delete({ where: { id } }),
    ]);

    return { message: 'User deleted successfully' };
  }

  async getStats() {
    const [totalStudents, pendingStudents, totalTeachers, pendingTeachers] = await Promise.all([
      this.prisma.user.count({
        where: { role: Role.STUDENT, status: UserStatus.APPROVED },
      }),
      this.prisma.user.count({
        where: { role: Role.STUDENT, status: UserStatus.PENDING },
      }),
      this.prisma.user.count({
        where: { role: Role.TEACHER, status: UserStatus.APPROVED },
      }),
      this.prisma.user.count({
        where: { role: Role.TEACHER, status: UserStatus.PENDING },
      }),
    ]);

    return {
      students: {
        total: totalStudents,
        pending: pendingStudents,
      },
      teachers: {
        total: totalTeachers,
        pending: pendingTeachers,
      },
    };
  }
}