import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/message.dto';
export declare class MessagesService {
    private prisma;
    constructor(prisma: PrismaService);
    sendMessage(createMessageDto: CreateMessageDto, senderId: string): Promise<{
        subject: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            classId: string;
        } | null;
        sender: {
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
            profileImage: string | null;
        };
        receiver: {
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
            profileImage: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        isRead: boolean;
        readAt: Date | null;
        subjectId: string | null;
        receiverId: string;
        senderId: string;
    }>;
    getConversations(userId: string): Promise<unknown>;
    getMessages(userId: string, otherUserId: string, limit?: number, offset?: number): Promise<({
        subject: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            classId: string;
        } | null;
        sender: {
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
            profileImage: string | null;
        };
        receiver: {
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
            profileImage: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        isRead: boolean;
        readAt: Date | null;
        subjectId: string | null;
        receiverId: string;
        senderId: string;
    })[]>;
    markAsRead(messageId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        isRead: boolean;
        readAt: Date | null;
        subjectId: string | null;
        receiverId: string;
        senderId: string;
    }>;
    deleteMessage(messageId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        isRead: boolean;
        readAt: Date | null;
        subjectId: string | null;
        receiverId: string;
        senderId: string;
    }>;
    private checkMessagePermission;
    getUnreadCount(userId: string): Promise<number>;
}
