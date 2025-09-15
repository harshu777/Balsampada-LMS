import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    userRole?: string;
    userEmail?: string;
}
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private notificationsService;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, notificationsService: NotificationsService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleMarkAsRead(data: {
        notificationId: string;
    }, client: AuthenticatedSocket): Promise<void>;
    handleMarkAllAsRead(client: AuthenticatedSocket): Promise<void>;
    handleGetRecentNotifications(data: {
        limit?: number;
    }, client: AuthenticatedSocket): Promise<void>;
    sendNotificationToUser(userId: string, notification: any): Promise<void>;
    sendNotificationToRole(role: string, notification: any): Promise<void>;
    broadcastNotification(notification: any): Promise<void>;
    sendPaymentNotification(userId: string, paymentData: {
        id: string;
        status: string;
        amount: number;
        type: string;
        rejectionReason?: string;
    }): Promise<void>;
    sendAssignmentNotification(userIds: string[], assignmentData: {
        id: string;
        title: string;
        subjectName: string;
        dueDate: string;
        teacherName: string;
    }): Promise<void>;
    sendClassStatusNotification(userIds: string[], classData: {
        id: string;
        title: string;
        status: string;
        startTime: string;
        meetingUrl?: string;
    }): Promise<void>;
    sendAttendanceNotification(userId: string, attendanceData: {
        sessionId: string;
        sessionTitle: string;
        status: string;
        date: string;
    }): Promise<void>;
    sendTestNotification(userIds: string[], testData: {
        id: string;
        title: string;
        subjectName: string;
        startTime: string;
        duration: number;
    }): Promise<void>;
    sendSystemBroadcast(message: string, targetRole?: string): Promise<void>;
}
export {};
