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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const notifications_service_1 = require("./notifications.service");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    jwtService;
    notificationsService;
    server;
    logger = new common_1.Logger(NotificationsGateway_1.name);
    constructor(jwtService, notificationsService) {
        this.jwtService = jwtService;
        this.notificationsService = notificationsService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token ||
                client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token`);
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            client.userId = payload.sub;
            client.userRole = payload.role;
            client.userEmail = payload.email;
            await client.join(`user:${client.userId}`);
            await client.join(`role:${client.userRole}`);
            this.logger.log(`Notification client connected: ${client.id} - User: ${client.userId} (${client.userRole})`);
            if (client.userId) {
                const unreadCount = await this.notificationsService.getUnreadCount(client.userId);
                client.emit('notification:unread-count', { count: unreadCount });
            }
        }
        catch (error) {
            this.logger.error(`Authentication failed for notification client ${client.id}:`, error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Notification client disconnected: ${client.id} - User: ${client.userId || 'unknown'}`);
    }
    async handleMarkAsRead(data, client) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'User not authenticated' });
                return;
            }
            await this.notificationsService.markAsRead(data.notificationId, client.userId);
            const unreadCount = await this.notificationsService.getUnreadCount(client.userId);
            client.emit('notification:unread-count', { count: unreadCount });
            this.logger.log(`Notification ${data.notificationId} marked as read by user ${client.userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to mark notification as read:`, error);
            client.emit('error', { message: 'Failed to mark notification as read' });
        }
    }
    async handleMarkAllAsRead(client) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'User not authenticated' });
                return;
            }
            await this.notificationsService.markAllAsRead(client.userId);
            client.emit('notification:unread-count', { count: 0 });
            client.emit('notification:all-marked-read');
            this.logger.log(`All notifications marked as read by user ${client.userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to mark all notifications as read:`, error);
            client.emit('error', { message: 'Failed to mark all notifications as read' });
        }
    }
    async handleGetRecentNotifications(data, client) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'User not authenticated' });
                return;
            }
            const notifications = await this.notificationsService.getRecentNotifications(client.userId, data.limit || 10);
            client.emit('notification:recent-list', { notifications });
        }
        catch (error) {
            this.logger.error(`Failed to get recent notifications:`, error);
            client.emit('error', { message: 'Failed to fetch notifications' });
        }
    }
    async sendNotificationToUser(userId, notification) {
        this.server.to(`user:${userId}`).emit('notification:new', notification);
    }
    async sendNotificationToRole(role, notification) {
        this.server.to(`role:${role}`).emit('notification:new', notification);
    }
    async broadcastNotification(notification) {
        this.server.emit('notification:new', notification);
    }
    async sendPaymentNotification(userId, paymentData) {
        const notification = {
            id: `payment-${paymentData.id}-${Date.now()}`,
            type: 'PAYMENT',
            title: paymentData.status === 'APPROVED' ? 'Payment Approved' : 'Payment Rejected',
            message: paymentData.status === 'APPROVED'
                ? `Your ${paymentData.type.toLowerCase()} payment of ₹${paymentData.amount} has been approved.`
                : `Your ${paymentData.type.toLowerCase()} payment of ₹${paymentData.amount} has been rejected. ${paymentData.rejectionReason ? `Reason: ${paymentData.rejectionReason}` : ''}`,
            timestamp: new Date().toISOString(),
            data: paymentData,
        };
        await this.sendNotificationToUser(userId, notification);
        await this.notificationsService.createNotification({
            userId,
            type: 'PAYMENT',
            title: notification.title,
            message: notification.message,
            data: paymentData,
        });
    }
    async sendAssignmentNotification(userIds, assignmentData) {
        const notification = {
            id: `assignment-${assignmentData.id}-${Date.now()}`,
            type: 'ASSIGNMENT',
            title: 'New Assignment',
            message: `New assignment "${assignmentData.title}" has been posted in ${assignmentData.subjectName}. Due: ${new Date(assignmentData.dueDate).toLocaleDateString()}`,
            timestamp: new Date().toISOString(),
            data: assignmentData,
        };
        for (const userId of userIds) {
            await this.sendNotificationToUser(userId, notification);
            await this.notificationsService.createNotification({
                userId,
                type: 'ASSIGNMENT',
                title: notification.title,
                message: notification.message,
                data: assignmentData,
            });
        }
    }
    async sendClassStatusNotification(userIds, classData) {
        const notification = {
            id: `class-${classData.id}-${Date.now()}`,
            type: 'CLASS',
            title: `Class ${classData.status}`,
            message: classData.status === 'STARTED'
                ? `Class "${classData.title}" has started. Join now!`
                : `Class "${classData.title}" has been ${classData.status.toLowerCase()}.`,
            timestamp: new Date().toISOString(),
            data: classData,
        };
        for (const userId of userIds) {
            await this.sendNotificationToUser(userId, notification);
            await this.notificationsService.createNotification({
                userId,
                type: 'CLASS',
                title: notification.title,
                message: notification.message,
                data: classData,
            });
        }
    }
    async sendAttendanceNotification(userId, attendanceData) {
        const notification = {
            id: `attendance-${attendanceData.sessionId}-${Date.now()}`,
            type: 'CLASS',
            title: 'Attendance Marked',
            message: `Your attendance has been marked as ${attendanceData.status} for "${attendanceData.sessionTitle}" on ${new Date(attendanceData.date).toLocaleDateString()}.`,
            timestamp: new Date().toISOString(),
            data: attendanceData,
        };
        await this.sendNotificationToUser(userId, notification);
        await this.notificationsService.createNotification({
            userId,
            type: 'CLASS',
            title: notification.title,
            message: notification.message,
            data: attendanceData,
        });
    }
    async sendTestNotification(userIds, testData) {
        const notification = {
            id: `test-${testData.id}-${Date.now()}`,
            type: 'TEST',
            title: 'New Test Available',
            message: `Test "${testData.title}" for ${testData.subjectName} is now available. Duration: ${testData.duration} minutes.`,
            timestamp: new Date().toISOString(),
            data: testData,
        };
        for (const userId of userIds) {
            await this.sendNotificationToUser(userId, notification);
            await this.notificationsService.createNotification({
                userId,
                type: 'TEST',
                title: notification.title,
                message: notification.message,
                data: testData,
            });
        }
    }
    async sendSystemBroadcast(message, targetRole) {
        const notification = {
            id: `broadcast-${Date.now()}`,
            type: 'SYSTEM',
            title: 'System Announcement',
            message,
            timestamp: new Date().toISOString(),
            data: { broadcast: true, targetRole },
        };
        if (targetRole) {
            await this.sendNotificationToRole(targetRole, notification);
        }
        else {
            await this.broadcastNotification(notification);
        }
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('notification:mark-read'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsGateway.prototype, "handleMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('notification:mark-all-read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsGateway.prototype, "handleMarkAllAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('notification:get-recent'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsGateway.prototype, "handleGetRecentNotifications", null);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/notifications',
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        notifications_service_1.NotificationsService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map