import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
interface AuthenticatedSocket extends Socket {
    userId?: number;
    userRole?: string;
    userEmail?: string;
}
export declare class WebSocketsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private readonly logger;
    private connectedUsers;
    constructor(jwtService: JwtService);
    afterInit(server: Server): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleTypingStart(data: {
        roomId: string;
        userName: string;
    }, client: AuthenticatedSocket): void;
    handleTypingStop(data: {
        roomId: string;
    }, client: AuthenticatedSocket): void;
    handleJoinClass(data: {
        classId: string;
    }, client: AuthenticatedSocket): void;
    handleLeaveClass(data: {
        classId: string;
    }, client: AuthenticatedSocket): void;
    broadcastToRole(role: string, event: string, data: any): Promise<void>;
    broadcastToUser(userId: number, event: string, data: any): Promise<void>;
    broadcastToClass(classId: string, event: string, data: any): Promise<void>;
    broadcastToAll(event: string, data: any): Promise<void>;
    sendBroadcastMessage(message: string, targetRole?: string): Promise<void>;
    getConnectedUsers(): number[];
    isUserOnline(userId: number): boolean;
}
export {};
