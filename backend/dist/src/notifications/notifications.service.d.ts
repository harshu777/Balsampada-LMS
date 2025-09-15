import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
}
export declare class NotificationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createNotification(data: CreateNotificationDto): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
        };
    } & {
        message: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
    createBulkNotifications(notifications: CreateNotificationDto[]): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getNotificationsByUser(userId: string, page?: number, limit?: number): Promise<{
        notifications: {
            message: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            type: import("@prisma/client").$Enums.NotificationType;
            title: string;
            userId: string;
            isRead: boolean;
            readAt: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getRecentNotifications(userId: string, limit?: number): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        isRead: boolean;
        readAt: Date | null;
    }[]>;
    getUnreadNotifications(userId: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        isRead: boolean;
        readAt: Date | null;
    }[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    deleteNotification(notificationId: string, userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    deleteOldNotifications(daysOld?: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    createPaymentNotification(userId: string, paymentId: string, status: 'APPROVED' | 'REJECTED', amount: number, type: string, rejectionReason?: string): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
        };
    } & {
        message: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
    createAssignmentNotification(userIds: string[], assignmentId: string, title: string, subjectName: string, dueDate: Date, teacherName: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    createClassNotification(userIds: string[], sessionId: string, title: string, status: 'STARTED' | 'ENDED' | 'CANCELLED', startTime: Date, meetingUrl?: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    createAttendanceNotification(userId: string, sessionId: string, sessionTitle: string, status: string, date: Date): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
        };
    } & {
        message: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        userId: string;
        isRead: boolean;
        readAt: Date | null;
    }>;
    createTestNotification(userIds: string[], testId: string, title: string, subjectName: string, startTime: Date, duration: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    createSystemNotification(userIds: string[], title: string, message: string, data?: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
    getNotificationStats(userId?: string): Promise<{
        total: number;
        unread: number;
        read: number;
        byType: Record<string, number>;
    }>;
}
export {};
