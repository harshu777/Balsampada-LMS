import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  userEmail?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
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

      // Join user-specific room
      await client.join(`user:${client.userId}`);

      // Join role-specific room
      await client.join(`role:${client.userRole}`);

      this.logger.log(
        `Notification client connected: ${client.id} - User: ${client.userId} (${client.userRole})`
      );

      // Send unread notifications count
      if (client.userId) {
        const unreadCount = await this.notificationsService.getUnreadCount(client.userId);
        client.emit('notification:unread-count', { count: unreadCount });
      }

    } catch (error) {
      this.logger.error(`Authentication failed for notification client ${client.id}:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(
      `Notification client disconnected: ${client.id} - User: ${client.userId || 'unknown'}`
    );
  }

  @SubscribeMessage('notification:mark-read')
  async handleMarkAsRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }
      
      await this.notificationsService.markAsRead(data.notificationId, client.userId);
      
      // Send updated unread count
      const unreadCount = await this.notificationsService.getUnreadCount(client.userId);
      client.emit('notification:unread-count', { count: unreadCount });
      
      this.logger.log(`Notification ${data.notificationId} marked as read by user ${client.userId}`);
    } catch (error) {
      this.logger.error(`Failed to mark notification as read:`, error);
      client.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  @SubscribeMessage('notification:mark-all-read')
  async handleMarkAllAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }
      
      await this.notificationsService.markAllAsRead(client.userId);
      
      client.emit('notification:unread-count', { count: 0 });
      client.emit('notification:all-marked-read');
      
      this.logger.log(`All notifications marked as read by user ${client.userId}`);
    } catch (error) {
      this.logger.error(`Failed to mark all notifications as read:`, error);
      client.emit('error', { message: 'Failed to mark all notifications as read' });
    }
  }

  @SubscribeMessage('notification:get-recent')
  async handleGetRecentNotifications(
    @MessageBody() data: { limit?: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'User not authenticated' });
        return;
      }
      
      const notifications = await this.notificationsService.getRecentNotifications(
        client.userId,
        data.limit || 10
      );
      
      client.emit('notification:recent-list', { notifications });
    } catch (error) {
      this.logger.error(`Failed to get recent notifications:`, error);
      client.emit('error', { message: 'Failed to fetch notifications' });
    }
  }

  // Method to send notifications to specific users
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  // Method to send notifications to users by role
  async sendNotificationToRole(role: string, notification: any) {
    this.server.to(`role:${role}`).emit('notification:new', notification);
  }

  // Method to broadcast notifications to all connected clients
  async broadcastNotification(notification: any) {
    this.server.emit('notification:new', notification);
  }

  // Payment approval/rejection notifications
  async sendPaymentNotification(userId: string, paymentData: {
    id: string;
    status: string;
    amount: number;
    type: string;
    rejectionReason?: string;
  }) {
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
    
    // Also persist to database
    await this.notificationsService.createNotification({
      userId,
      type: 'PAYMENT',
      title: notification.title,
      message: notification.message,
      data: paymentData,
    });
  }

  // Assignment notifications
  async sendAssignmentNotification(userIds: string[], assignmentData: {
    id: string;
    title: string;
    subjectName: string;
    dueDate: string;
    teacherName: string;
  }) {
    const notification = {
      id: `assignment-${assignmentData.id}-${Date.now()}`,
      type: 'ASSIGNMENT',
      title: 'New Assignment',
      message: `New assignment "${assignmentData.title}" has been posted in ${assignmentData.subjectName}. Due: ${new Date(assignmentData.dueDate).toLocaleDateString()}`,
      timestamp: new Date().toISOString(),
      data: assignmentData,
    };

    // Send to all students
    for (const userId of userIds) {
      await this.sendNotificationToUser(userId, notification);
      
      // Persist to database
      await this.notificationsService.createNotification({
        userId,
        type: 'ASSIGNMENT',
        title: notification.title,
        message: notification.message,
        data: assignmentData,
      });
    }
  }

  // Class status update notifications
  async sendClassStatusNotification(userIds: string[], classData: {
    id: string;
    title: string;
    status: string;
    startTime: string;
    meetingUrl?: string;
  }) {
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

    // Send to all enrolled students and teacher
    for (const userId of userIds) {
      await this.sendNotificationToUser(userId, notification);
      
      // Persist to database
      await this.notificationsService.createNotification({
        userId,
        type: 'CLASS',
        title: notification.title,
        message: notification.message,
        data: classData,
      });
    }
  }

  // Attendance marking notifications
  async sendAttendanceNotification(userId: string, attendanceData: {
    sessionId: string;
    sessionTitle: string;
    status: string;
    date: string;
  }) {
    const notification = {
      id: `attendance-${attendanceData.sessionId}-${Date.now()}`,
      type: 'CLASS',
      title: 'Attendance Marked',
      message: `Your attendance has been marked as ${attendanceData.status} for "${attendanceData.sessionTitle}" on ${new Date(attendanceData.date).toLocaleDateString()}.`,
      timestamp: new Date().toISOString(),
      data: attendanceData,
    };

    await this.sendNotificationToUser(userId, notification);
    
    // Persist to database
    await this.notificationsService.createNotification({
      userId,
      type: 'CLASS',
      title: notification.title,
      message: notification.message,
      data: attendanceData,
    });
  }

  // Test/Exam notifications
  async sendTestNotification(userIds: string[], testData: {
    id: string;
    title: string;
    subjectName: string;
    startTime: string;
    duration: number;
  }) {
    const notification = {
      id: `test-${testData.id}-${Date.now()}`,
      type: 'TEST',
      title: 'New Test Available',
      message: `Test "${testData.title}" for ${testData.subjectName} is now available. Duration: ${testData.duration} minutes.`,
      timestamp: new Date().toISOString(),
      data: testData,
    };

    // Send to all students
    for (const userId of userIds) {
      await this.sendNotificationToUser(userId, notification);
      
      // Persist to database
      await this.notificationsService.createNotification({
        userId,
        type: 'TEST',
        title: notification.title,
        message: notification.message,
        data: testData,
      });
    }
  }

  // System broadcast notifications
  async sendSystemBroadcast(message: string, targetRole?: string) {
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
    } else {
      await this.broadcastNotification(notification);
    }
  }
}