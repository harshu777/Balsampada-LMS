import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any, page?: string, limit?: string): Promise<{
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
    getUnreadNotifications(req: any): Promise<{
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
    }>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(id: string, req: any): Promise<void>;
    markAllAsRead(req: any): Promise<void>;
    deleteNotification(id: string, req: any): Promise<void>;
    clearNotifications(req: any): Promise<void>;
}
