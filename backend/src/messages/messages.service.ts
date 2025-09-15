import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(createMessageDto: CreateMessageDto, senderId: string) {
    const receiver = await this.prisma.user.findUnique({
      where: { id: createMessageDto.receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    // Check if communication is allowed based on roles
    const isAllowed = await this.checkMessagePermission(sender, receiver);
    if (!isAllowed) {
      throw new ForbiddenException('You cannot send messages to this user');
    }

    const message = await this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        senderId,
        receiverId: createMessageDto.receiverId,
        subjectId: createMessageDto.subjectId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profileImage: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profileImage: true,
          },
        },
        subject: true,
      },
    });

    // Create notification for receiver
    await this.prisma.notification.create({
      data: {
        userId: createMessageDto.receiverId,
        type: 'MESSAGE',
        title: 'New Message',
        message: `${sender.firstName} ${sender.lastName} sent you a message`,
        data: { messageId: message.id },
      },
    });

    return message;
  }

  async getConversations(userId: string) {
    const conversations = await this.prisma.$queryRaw`
      SELECT DISTINCT ON (other_user_id)
        CASE 
          WHEN m."senderId" = ${userId} THEN m."receiverId"
          ELSE m."senderId"
        END as other_user_id,
        u.id,
        u."firstName",
        u."lastName",
        u.email,
        u.role,
        u."profileImage",
        m.content as last_message,
        m."createdAt" as last_message_time,
        m."isRead"
      FROM "Message" m
      JOIN "User" u ON u.id = CASE 
        WHEN m."senderId" = ${userId} THEN m."receiverId"
        ELSE m."senderId"
      END
      WHERE m."senderId" = ${userId} OR m."receiverId" = ${userId}
      ORDER BY other_user_id, m."createdAt" DESC
    `;

    return conversations;
  }

  async getMessages(userId: string, otherUserId: string, limit = 50, offset = 0) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profileImage: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profileImage: true,
          },
        },
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Mark messages as read
    await this.prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return messages.reverse();
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new ForbiddenException('You cannot mark this message as read');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }

  private async checkMessagePermission(sender: any, receiver: any): Promise<boolean> {
    // Admin can message anyone
    if (sender.role === 'ADMIN' || receiver.role === 'ADMIN') {
      return true;
    }

    // Teachers can message students they teach
    if (sender.role === 'TEACHER' && receiver.role === 'STUDENT') {
      const teacherSubjects = await this.prisma.teacherSubject.findMany({
        where: { teacherId: sender.id, isActive: true },
        select: { subjectId: true },
      });

      const studentEnrollments = await this.prisma.studentEnrollment.findMany({
        where: { 
          studentId: receiver.id, 
          isActive: true,
          subjectId: { in: teacherSubjects.map(ts => ts.subjectId) },
        },
      });

      return studentEnrollments.length > 0;
    }

    // Students can message their teachers
    if (sender.role === 'STUDENT' && receiver.role === 'TEACHER') {
      const studentEnrollments = await this.prisma.studentEnrollment.findMany({
        where: { studentId: sender.id, isActive: true },
        select: { subjectId: true },
      });

      const teacherSubjects = await this.prisma.teacherSubject.findMany({
        where: { 
          teacherId: receiver.id, 
          isActive: true,
          subjectId: { in: studentEnrollments.map(se => se.subjectId) },
        },
      });

      return teacherSubjects.length > 0;
    }

    // Teachers can message other teachers
    if (sender.role === 'TEACHER' && receiver.role === 'TEACHER') {
      return true;
    }

    return false;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }
}