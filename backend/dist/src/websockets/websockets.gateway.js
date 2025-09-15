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
var WebSocketsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let WebSocketsGateway = WebSocketsGateway_1 = class WebSocketsGateway {
    jwtService;
    server;
    logger = new common_1.Logger(WebSocketsGateway_1.name);
    connectedUsers = new Map();
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    afterInit(server) {
        this.logger.log('WebSocket server initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token`);
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            client.userId = payload.sub;
            client.userRole = payload.role;
            client.userEmail = payload.email;
            if (client.userId) {
                this.connectedUsers.set(client.userId, client.id);
            }
            await client.join(`role:${client.userRole}`);
            await client.join(`user:${client.userId}`);
            if (client.userRole === 'ADMIN') {
                await client.join('admin');
            }
            this.logger.log(`Client ${client.id} connected - User: ${client.userId} (${client.userRole})`);
            client.broadcast.emit('user:online', {
                userId: client.userId,
                email: client.userEmail,
                role: client.userRole,
            });
            const onlineUsers = Array.from(this.connectedUsers.keys());
            client.emit('users:online', onlineUsers);
        }
        catch (error) {
            this.logger.error(`Authentication failed for client ${client.id}:`, error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.userId) {
            this.connectedUsers.delete(client.userId);
            client.broadcast.emit('user:offline', {
                userId: client.userId,
                email: client.userEmail,
                role: client.userRole,
            });
            this.logger.log(`Client ${client.id} disconnected - User: ${client.userId} (${client.userRole})`);
        }
        else {
            this.logger.log(`Client ${client.id} disconnected`);
        }
    }
    handleTypingStart(data, client) {
        client.to(data.roomId).emit('typing:start', {
            userId: client.userId,
            userName: data.userName,
            roomId: data.roomId,
        });
    }
    handleTypingStop(data, client) {
        client.to(data.roomId).emit('typing:stop', {
            userId: client.userId,
            roomId: data.roomId,
        });
    }
    handleJoinClass(data, client) {
        client.join(`class:${data.classId}`);
        client.to(`class:${data.classId}`).emit('class:user-joined', {
            userId: client.userId,
            userEmail: client.userEmail,
            userRole: client.userRole,
            classId: data.classId,
        });
        this.logger.log(`User ${client.userId} joined class ${data.classId}`);
    }
    handleLeaveClass(data, client) {
        client.leave(`class:${data.classId}`);
        client.to(`class:${data.classId}`).emit('class:user-left', {
            userId: client.userId,
            userEmail: client.userEmail,
            classId: data.classId,
        });
        this.logger.log(`User ${client.userId} left class ${data.classId}`);
    }
    async broadcastToRole(role, event, data) {
        this.server.to(`role:${role}`).emit(event, data);
    }
    async broadcastToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    async broadcastToClass(classId, event, data) {
        this.server.to(`class:${classId}`).emit(event, data);
    }
    async broadcastToAll(event, data) {
        this.server.emit(event, data);
    }
    async sendBroadcastMessage(message, targetRole) {
        const broadcastData = {
            id: Date.now().toString(),
            message,
            timestamp: new Date().toISOString(),
            sender: 'ADMIN',
            type: 'BROADCAST',
        };
        if (targetRole) {
            this.server.to(`role:${targetRole}`).emit('broadcast:message', broadcastData);
        }
        else {
            this.server.emit('broadcast:message', broadcastData);
        }
        this.logger.log(`Broadcast message sent to ${targetRole || 'all users'}: ${message}`);
    }
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }
};
exports.WebSocketsGateway = WebSocketsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebSocketsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WebSocketsGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing:stop'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WebSocketsGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('class:join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WebSocketsGateway.prototype, "handleJoinClass", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('class:leave'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WebSocketsGateway.prototype, "handleLeaveClass", null);
exports.WebSocketsGateway = WebSocketsGateway = WebSocketsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], WebSocketsGateway);
//# sourceMappingURL=websockets.gateway.js.map