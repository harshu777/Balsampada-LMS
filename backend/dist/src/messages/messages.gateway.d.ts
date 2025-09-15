import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
export declare class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private messagesService;
    private jwtService;
    server: Server;
    private userSockets;
    constructor(messagesService: MessagesService, jwtService: JwtService);
    handleConnection(socket: Socket): Promise<void>;
    handleDisconnect(socket: Socket): void;
    handleMessage(data: {
        receiverId: string;
        content: string;
        subjectId?: string;
    }, socket: Socket): Promise<{
        success: boolean;
        message: {
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
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    handleMarkAsRead(data: {
        messageId: string;
    }, socket: Socket): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleTyping(data: {
        receiverId: string;
        isTyping: boolean;
    }, socket: Socket): Promise<void>;
    handleJoinConversation(data: {
        otherUserId: string;
    }, socket: Socket): Promise<{
        success: boolean;
        room: string;
    }>;
    handleLeaveConversation(data: {
        otherUserId: string;
    }, socket: Socket): Promise<{
        success: boolean;
    }>;
    private getConversationRoom;
}
