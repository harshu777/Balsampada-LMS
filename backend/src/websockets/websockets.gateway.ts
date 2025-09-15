import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
  userEmail?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/',
})
export class WebSocketsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketsGateway.name);
  private connectedUsers = new Map<number, string>(); // userId -> socketId

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket server initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
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

      // Store connected user
      if (client.userId) {
        this.connectedUsers.set(client.userId, client.id);
      }

      // Join role-based rooms
      await client.join(`role:${client.userRole}`);
      await client.join(`user:${client.userId}`);

      // Join admin room if user is admin
      if (client.userRole === 'ADMIN') {
        await client.join('admin');
      }

      this.logger.log(
        `Client ${client.id} connected - User: ${client.userId} (${client.userRole})`
      );

      // Notify others about user coming online
      client.broadcast.emit('user:online', {
        userId: client.userId,
        email: client.userEmail,
        role: client.userRole,
      });

      // Send connected users list to the new client
      const onlineUsers = Array.from(this.connectedUsers.keys());
      client.emit('users:online', onlineUsers);

    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      
      // Notify others about user going offline
      client.broadcast.emit('user:offline', {
        userId: client.userId,
        email: client.userEmail,
        role: client.userRole,
      });

      this.logger.log(
        `Client ${client.id} disconnected - User: ${client.userId} (${client.userRole})`
      );
    } else {
      this.logger.log(`Client ${client.id} disconnected`);
    }
  }

  // User presence events
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @MessageBody() data: { roomId: string; userName: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.to(data.roomId).emit('typing:start', {
      userId: client.userId,
      userName: data.userName,
      roomId: data.roomId,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.to(data.roomId).emit('typing:stop', {
      userId: client.userId,
      roomId: data.roomId,
    });
  }

  // Class status updates
  @SubscribeMessage('class:join')
  handleJoinClass(
    @MessageBody() data: { classId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.join(`class:${data.classId}`);
    client.to(`class:${data.classId}`).emit('class:user-joined', {
      userId: client.userId,
      userEmail: client.userEmail,
      userRole: client.userRole,
      classId: data.classId,
    });
    this.logger.log(`User ${client.userId} joined class ${data.classId}`);
  }

  @SubscribeMessage('class:leave')
  handleLeaveClass(
    @MessageBody() data: { classId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(`class:${data.classId}`);
    client.to(`class:${data.classId}`).emit('class:user-left', {
      userId: client.userId,
      userEmail: client.userEmail,
      classId: data.classId,
    });
    this.logger.log(`User ${client.userId} left class ${data.classId}`);
  }

  // Admin broadcast methods
  async broadcastToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  async broadcastToUser(userId: number, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  async broadcastToClass(classId: string, event: string, data: any) {
    this.server.to(`class:${classId}`).emit(event, data);
  }

  async broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Admin broadcast message
  async sendBroadcastMessage(message: string, targetRole?: string) {
    const broadcastData = {
      id: Date.now().toString(),
      message,
      timestamp: new Date().toISOString(),
      sender: 'ADMIN',
      type: 'BROADCAST',
    };

    if (targetRole) {
      this.server.to(`role:${targetRole}`).emit('broadcast:message', broadcastData);
    } else {
      this.server.emit('broadcast:message', broadcastData);
    }

    this.logger.log(`Broadcast message sent to ${targetRole || 'all users'}: ${message}`);
  }

  // Get connected users
  getConnectedUsers(): number[] {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is online
  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }
}