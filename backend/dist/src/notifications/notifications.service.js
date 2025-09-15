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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(data) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId: data.userId,
                    type: data.type,
                    title: data.title,
                    message: data.message,
                    data: data.data || {},
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                },
            });
            this.logger.log(`Created notification ${notification.id} for user ${data.userId}`);
            return notification;
        }
        catch (error) {
            this.logger.error('Failed to create notification:', error);
            throw error;
        }
    }
    async createBulkNotifications(notifications) {
        try {
            const result = await this.prisma.notification.createMany({
                data: notifications.map(notif => ({
                    userId: notif.userId,
                    type: notif.type,
                    title: notif.title,
                    message: notif.message,
                    data: notif.data || {},
                })),
            });
            this.logger.log(`Created ${result.count} bulk notifications`);
            return result;
        }
        catch (error) {
            this.logger.error('Failed to create bulk notifications:', error);
            throw error;
        }
    }
    async getNotificationsByUser(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const [notifications, total] = await Promise.all([
                this.prisma.notification.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.prisma.notification.count({
                    where: { userId },
                }),
            ]);
            return {
                notifications,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get notifications for user ${userId}:`, error);
            throw error;
        }
    }
    async getRecentNotifications(userId, limit = 10) {
        try {
            const notifications = await this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
            return notifications;
        }
        catch (error) {
            this.logger.error(`Failed to get recent notifications for user ${userId}:`, error);
            throw error;
        }
    }
    async getUnreadNotifications(userId) {
        try {
            const notifications = await this.prisma.notification.findMany({
                where: {
                    userId,
                    isRead: false,
                },
                orderBy: { createdAt: 'desc' },
            });
            return notifications;
        }
        catch (error) {
            this.logger.error(`Failed to get unread notifications for user ${userId}:`, error);
            throw error;
        }
    }
    async getUnreadCount(userId) {
        try {
            const count = await this.prisma.notification.count({
                where: {
                    userId,
                    isRead: false,
                },
            });
            return count;
        }
        catch (error) {
            this.logger.error(`Failed to get unread count for user ${userId}:`, error);
            return 0;
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            const notification = await this.prisma.notification.updateMany({
                where: {
                    id: notificationId,
                    userId,
                },
                data: {
                    isRead: true,
                    readAt: new Date(),
                },
            });
            if (notification.count === 0) {
                throw new Error('Notification not found or not owned by user');
            }
            this.logger.log(`Marked notification ${notificationId} as read for user ${userId}`);
            return notification;
        }
        catch (error) {
            this.logger.error(`Failed to mark notification as read:`, error);
            throw error;
        }
    }
    async markAllAsRead(userId) {
        try {
            const result = await this.prisma.notification.updateMany({
                where: {
                    userId,
                    isRead: false,
                },
                data: {
                    isRead: true,
                    readAt: new Date(),
                },
            });
            this.logger.log(`Marked ${result.count} notifications as read for user ${userId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to mark all notifications as read for user ${userId}:`, error);
            throw error;
        }
    }
    async deleteNotification(notificationId, userId) {
        try {
            const notification = await this.prisma.notification.deleteMany({
                where: {
                    id: notificationId,
                    userId,
                },
            });
            if (notification.count === 0) {
                throw new Error('Notification not found or not owned by user');
            }
            this.logger.log(`Deleted notification ${notificationId} for user ${userId}`);
            return notification;
        }
        catch (error) {
            this.logger.error(`Failed to delete notification:`, error);
            throw error;
        }
    }
    async deleteOldNotifications(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            const result = await this.prisma.notification.deleteMany({
                where: {
                    createdAt: {
                        lt: cutoffDate,
                    },
                    isRead: true,
                },
            });
            this.logger.log(`Deleted ${result.count} old notifications`);
            return result;
        }
        catch (error) {
            this.logger.error('Failed to delete old notifications:', error);
            throw error;
        }
    }
    async createPaymentNotification(userId, paymentId, status, amount, type, rejectionReason) {
        const title = status === 'APPROVED' ? 'Payment Approved' : 'Payment Rejected';
        const message = status === 'APPROVED'
            ? `Your ${type.toLowerCase()} payment of ₹${amount} has been approved.`
            : `Your ${type.toLowerCase()} payment of ₹${amount} has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`;
        return this.createNotification({
            userId,
            type: 'PAYMENT',
            title,
            message,
            data: {
                paymentId,
                status,
                amount,
                type,
                rejectionReason,
            },
        });
    }
    async createAssignmentNotification(userIds, assignmentId, title, subjectName, dueDate, teacherName) {
        const notifications = userIds.map(userId => ({
            userId,
            type: 'ASSIGNMENT',
            title: 'New Assignment',
            message: `New assignment "${title}" has been posted in ${subjectName}. Due: ${dueDate.toLocaleDateString()}`,
            data: {
                assignmentId,
                title,
                subjectName,
                dueDate: dueDate.toISOString(),
                teacherName,
            },
        }));
        return this.createBulkNotifications(notifications);
    }
    async createClassNotification(userIds, sessionId, title, status, startTime, meetingUrl) {
        const message = status === 'STARTED'
            ? `Class "${title}" has started. Join now!`
            : `Class "${title}" has been ${status.toLowerCase()}.`;
        const notifications = userIds.map(userId => ({
            userId,
            type: 'CLASS',
            title: `Class ${status}`,
            message,
            data: {
                sessionId,
                title,
                status,
                startTime: startTime.toISOString(),
                meetingUrl,
            },
        }));
        return this.createBulkNotifications(notifications);
    }
    async createAttendanceNotification(userId, sessionId, sessionTitle, status, date) {
        return this.createNotification({
            userId,
            type: 'CLASS',
            title: 'Attendance Marked',
            message: `Your attendance has been marked as ${status} for "${sessionTitle}" on ${date.toLocaleDateString()}.`,
            data: {
                sessionId,
                sessionTitle,
                status,
                date: date.toISOString(),
            },
        });
    }
    async createTestNotification(userIds, testId, title, subjectName, startTime, duration) {
        const notifications = userIds.map(userId => ({
            userId,
            type: 'TEST',
            title: 'New Test Available',
            message: `Test "${title}" for ${subjectName} is now available. Duration: ${duration} minutes.`,
            data: {
                testId,
                title,
                subjectName,
                startTime: startTime.toISOString(),
                duration,
            },
        }));
        return this.createBulkNotifications(notifications);
    }
    async createSystemNotification(userIds, title, message, data) {
        const notifications = userIds.map(userId => ({
            userId,
            type: 'SYSTEM',
            title,
            message,
            data,
        }));
        return this.createBulkNotifications(notifications);
    }
    async getNotificationStats(userId) {
        try {
            const whereClause = userId ? { userId } : {};
            const [total, unread, byType] = await Promise.all([
                this.prisma.notification.count({ where: whereClause }),
                this.prisma.notification.count({
                    where: { ...whereClause, isRead: false }
                }),
                this.prisma.notification.groupBy({
                    by: ['type'],
                    where: whereClause,
                    _count: { type: true },
                }),
            ]);
            return {
                total,
                unread,
                read: total - unread,
                byType: byType.reduce((acc, item) => {
                    acc[item.type] = item._count.type;
                    return acc;
                }, {}),
            };
        }
        catch (error) {
            this.logger.error('Failed to get notification stats:', error);
            throw error;
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map