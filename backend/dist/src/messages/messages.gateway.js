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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const messages_service_1 = require("./messages.service");
const jwt_1 = require("@nestjs/jwt");
let MessagesGateway = class MessagesGateway {
    messagesService;
    jwtService;
    server;
    userSockets = new Map();
    constructor(messagesService, jwtService) {
        this.messagesService = messagesService;
        this.jwtService = jwtService;
    }
    async handleConnection(socket) {
        try {
            const token = socket.handshake.auth.token;
            const payload = this.jwtService.verify(token);
            const userId = payload.sub;
            this.userSockets.set(userId, socket.id);
            socket.data.userId = userId;
            socket.join(`user-${userId}`);
            const unreadCount = await this.messagesService.getUnreadCount(userId);
            socket.emit('unreadCount', unreadCount);
            console.log(`User ${userId} connected to messages`);
        }
        catch (error) {
            console.error('Connection error:', error);
            socket.disconnect();
        }
    }
    handleDisconnect(socket) {
        const userId = socket.data.userId;
        if (userId) {
            this.userSockets.delete(userId);
            console.log(`User ${userId} disconnected from messages`);
        }
    }
    async handleMessage(data, socket) {
        const senderId = socket.data.userId;
        try {
            const message = await this.messagesService.sendMessage({
                receiverId: data.receiverId,
                content: data.content,
                subjectId: data.subjectId,
            }, senderId);
            socket.emit('newMessage', message);
            this.server.to(`user-${data.receiverId}`).emit('newMessage', message);
            const unreadCount = await this.messagesService.getUnreadCount(data.receiverId);
            this.server.to(`user-${data.receiverId}`).emit('unreadCount', unreadCount);
            return { success: true, message };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleMarkAsRead(data, socket) {
        const userId = socket.data.userId;
        try {
            await this.messagesService.markAsRead(data.messageId, userId);
            const unreadCount = await this.messagesService.getUnreadCount(userId);
            socket.emit('unreadCount', unreadCount);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleTyping(data, socket) {
        const senderId = socket.data.userId;
        this.server.to(`user-${data.receiverId}`).emit('userTyping', {
            userId: senderId,
            isTyping: data.isTyping,
        });
    }
    async handleJoinConversation(data, socket) {
        const userId = socket.data.userId;
        const conversationRoom = this.getConversationRoom(userId, data.otherUserId);
        socket.join(conversationRoom);
        return { success: true, room: conversationRoom };
    }
    async handleLeaveConversation(data, socket) {
        const userId = socket.data.userId;
        const conversationRoom = this.getConversationRoom(userId, data.otherUserId);
        socket.leave(conversationRoom);
        return { success: true };
    }
    getConversationRoom(userId1, userId2) {
        const sortedIds = [userId1, userId2].sort();
        return `conversation-${sortedIds[0]}-${sortedIds[1]}`;
    }
};
exports.MessagesGateway = MessagesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('markAsRead'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinConversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveConversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleLeaveConversation", null);
exports.MessagesGateway = MessagesGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? process.env.FRONTEND_URL
                : ['http://localhost:3000', 'http://localhost:3001'],
            credentials: true,
        },
        namespace: 'messages',
    }),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        jwt_1.JwtService])
], MessagesGateway);
//# sourceMappingURL=messages.gateway.js.map