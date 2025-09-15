import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  namespace: 'messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      
      this.userSockets.set(userId, socket.id);
      socket.data.userId = userId;
      
      socket.join(`user-${userId}`);
      
      // Send unread count on connection
      const unreadCount = await this.messagesService.getUnreadCount(userId);
      socket.emit('unreadCount', unreadCount);
      
      console.log(`User ${userId} connected to messages`);
    } catch (error) {
      console.error('Connection error:', error);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      console.log(`User ${userId} disconnected from messages`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { receiverId: string; content: string; subjectId?: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const senderId = socket.data.userId;
    
    try {
      const message = await this.messagesService.sendMessage(
        {
          receiverId: data.receiverId,
          content: data.content,
          subjectId: data.subjectId,
        },
        senderId,
      );
      
      // Send to sender
      socket.emit('newMessage', message);
      
      // Send to receiver if online
      this.server.to(`user-${data.receiverId}`).emit('newMessage', message);
      
      // Update unread count for receiver
      const unreadCount = await this.messagesService.getUnreadCount(data.receiverId);
      this.server.to(`user-${data.receiverId}`).emit('unreadCount', unreadCount);
      
      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = socket.data.userId;
    
    try {
      await this.messagesService.markAsRead(data.messageId, userId);
      
      // Update unread count
      const unreadCount = await this.messagesService.getUnreadCount(userId);
      socket.emit('unreadCount', unreadCount);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { receiverId: string; isTyping: boolean },
    @ConnectedSocket() socket: Socket,
  ) {
    const senderId = socket.data.userId;
    
    this.server.to(`user-${data.receiverId}`).emit('userTyping', {
      userId: senderId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { otherUserId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = socket.data.userId;
    const conversationRoom = this.getConversationRoom(userId, data.otherUserId);
    
    socket.join(conversationRoom);
    
    return { success: true, room: conversationRoom };
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @MessageBody() data: { otherUserId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = socket.data.userId;
    const conversationRoom = this.getConversationRoom(userId, data.otherUserId);
    
    socket.leave(conversationRoom);
    
    return { success: true };
  }

  private getConversationRoom(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `conversation-${sortedIds[0]}-${sortedIds[1]}`;
  }
}