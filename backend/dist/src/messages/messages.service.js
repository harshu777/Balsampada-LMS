"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MessagesService = class MessagesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendMessage(createMessageDto, senderId) {
        const receiver = await this.prisma.user.findUnique({
            where: { id: createMessageDto.receiverId },
        });
        if (!receiver) {
            throw new common_1.NotFoundException('Receiver not found');
        }
        const sender = await this.prisma.user.findUnique({
            where: { id: senderId },
        });
        if (!sender) {
            throw new common_1.NotFoundException('Sender not found');
        }
        const isAllowed = await this.checkMessagePermission(sender, receiver);
        if (!isAllowed) {
            throw new common_1.ForbiddenException('You cannot send messages to this user');
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
    async getConversations(userId) {
        const conversations = await this.prisma.$queryRaw `
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
    async getMessages(userId, otherUserId, limit = 50, offset = 0) {
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
    async markAsRead(messageId, userId) {
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.receiverId !== userId) {
            throw new common_1.ForbiddenException('You cannot mark this message as read');
        }
        return this.prisma.message.update({
            where: { id: messageId },
            data: { isRead: true },
        });
    }
    async deleteMessage(messageId, userId) {
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own messages');
        }
        return this.prisma.message.delete({
            where: { id: messageId },
        });
    }
    async checkMessagePermission(sender, receiver) {
        if (sender.role === 'ADMIN' || receiver.role === 'ADMIN') {
            return true;
        }
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
        if (sender.role === 'TEACHER' && receiver.role === 'TEACHER') {
            return true;
        }
        return false;
    }
    async getUnreadCount(userId) {
        return this.prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false,
            },
        });
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map