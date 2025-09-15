import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    sendMessage(createMessageDto: CreateMessageDto, req: any): Promise<{
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
    getConversations(req: any): Promise<unknown>;
    getMessages(otherUserId: string, limit?: string, offset?: string, req?: any): Promise<({
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
    markAsRead(id: string, req: any): Promise<{
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
    deleteMessage(id: string, req: any): Promise<{
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
    getUnreadCount(req: any): Promise<number>;
}
