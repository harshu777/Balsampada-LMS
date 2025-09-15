import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private notificationSocket: Socket | null = null;
  private token: string | null = null;

  // Initialize main socket connection
  connect(token: string): Socket {
    if (this.socket?.connected && this.token === token) {
      return this.socket;
    }

    // Disconnect existing connection if different token
    if (this.socket && this.token !== token) {
      this.disconnect();
    }

    this.token = token;
    
    this.socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
    });

    this.setupMainSocketEvents();
    return this.socket;
  }

  // Initialize notification socket connection
  connectNotifications(token: string): Socket {
    if (this.notificationSocket?.connected && this.token === token) {
      return this.notificationSocket;
    }

    // Disconnect existing connection if different token
    if (this.notificationSocket && this.token !== token) {
      this.disconnectNotifications();
    }

    this.token = token;

    this.notificationSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/notifications`, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
    });

    this.setupNotificationSocketEvents();
    return this.notificationSocket;
  }

  // Main socket event setup
  private setupMainSocketEvents() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to main socket:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from main socket:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔥 Main socket connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to main socket after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔥 Main socket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('💥 Main socket reconnection failed');
    });
  }

  // Notification socket event setup
  private setupNotificationSocketEvents() {
    if (!this.notificationSocket) return;

    this.notificationSocket.on('connect', () => {
      console.log('✅ Connected to notification socket:', this.notificationSocket?.id);
    });

    this.notificationSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from notification socket:', reason);
    });

    this.notificationSocket.on('connect_error', (error) => {
      console.error('🔥 Notification socket connection error:', error);
    });

    this.notificationSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to notification socket after', attemptNumber, 'attempts');
    });

    this.notificationSocket.on('reconnect_error', (error) => {
      console.error('🔥 Notification socket reconnection error:', error);
    });

    this.notificationSocket.on('reconnect_failed', () => {
      console.error('💥 Notification socket reconnection failed');
    });
  }

  // Disconnect main socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Disconnect notification socket
  disconnectNotifications() {
    if (this.notificationSocket) {
      this.notificationSocket.disconnect();
      this.notificationSocket = null;
    }
  }

  // Disconnect all sockets
  disconnectAll() {
    this.disconnect();
    this.disconnectNotifications();
    this.token = null;
  }

  // Get main socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Get notification socket instance
  getNotificationSocket(): Socket | null {
    return this.notificationSocket;
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  isNotificationSocketConnected(): boolean {
    return this.notificationSocket?.connected || false;
  }

  // Main socket methods
  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('🚫 Cannot emit event - main socket not connected');
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Notification socket methods
  emitNotification(event: string, data?: any) {
    if (this.notificationSocket?.connected) {
      this.notificationSocket.emit(event, data);
    } else {
      console.warn('🚫 Cannot emit notification event - notification socket not connected');
    }
  }

  onNotification(event: string, callback: (...args: any[]) => void) {
    if (this.notificationSocket) {
      this.notificationSocket.on(event, callback);
    }
  }

  offNotification(event: string, callback?: (...args: any[]) => void) {
    if (this.notificationSocket) {
      if (callback) {
        this.notificationSocket.off(event, callback);
      } else {
        this.notificationSocket.off(event);
      }
    }
  }

  // Convenience methods for common operations

  // User presence
  joinClass(classId: string) {
    this.emit('class:join', { classId });
  }

  leaveClass(classId: string) {
    this.emit('class:leave', { classId });
  }

  startTyping(roomId: string, userName: string) {
    this.emit('typing:start', { roomId, userName });
  }

  stopTyping(roomId: string) {
    this.emit('typing:stop', { roomId });
  }

  // Notification methods
  markNotificationAsRead(notificationId: string) {
    this.emitNotification('notification:mark-read', { notificationId });
  }

  markAllNotificationsAsRead() {
    this.emitNotification('notification:mark-all-read');
  }

  getRecentNotifications(limit = 20) {
    this.emitNotification('notification:get-recent', { limit });
  }

  // Event listener helpers
  onUserOnline(callback: (user: any) => void) {
    this.on('user:online', callback);
  }

  onUserOffline(callback: (user: any) => void) {
    this.on('user:offline', callback);
  }

  onUsersOnline(callback: (users: string[]) => void) {
    this.on('users:online', callback);
  }

  onTypingStart(callback: (data: { userId: string; userName: string; roomId: string }) => void) {
    this.on('typing:start', callback);
  }

  onTypingStop(callback: (data: { userId: string; roomId: string }) => void) {
    this.on('typing:stop', callback);
  }

  onClassUserJoined(callback: (data: any) => void) {
    this.on('class:user-joined', callback);
  }

  onClassUserLeft(callback: (data: any) => void) {
    this.on('class:user-left', callback);
  }

  onBroadcastMessage(callback: (message: any) => void) {
    this.on('broadcast:message', callback);
  }

  // Notification event listeners
  onNewNotification(callback: (notification: any) => void) {
    this.onNotification('notification:new', callback);
  }

  onUnreadCountUpdate(callback: (data: { count: number }) => void) {
    this.onNotification('notification:unread-count', callback);
  }

  onRecentNotifications(callback: (data: { notifications: any[] }) => void) {
    this.onNotification('notification:recent-list', callback);
  }

  onAllNotificationsMarkedRead(callback: () => void) {
    this.onNotification('notification:all-marked-read', callback);
  }

  onNotificationError(callback: (error: { message: string }) => void) {
    this.onNotification('error', callback);
  }

  // Remove event listeners
  removeUserOnlineListener(callback?: (user: any) => void) {
    this.off('user:online', callback);
  }

  removeUserOfflineListener(callback?: (user: any) => void) {
    this.off('user:offline', callback);
  }

  removeTypingListeners() {
    this.off('typing:start');
    this.off('typing:stop');
  }

  removeClassListeners() {
    this.off('class:user-joined');
    this.off('class:user-left');
  }

  removeBroadcastListener(callback?: (message: any) => void) {
    this.off('broadcast:message', callback);
  }

  removeNotificationListener(callback?: (notification: any) => void) {
    this.offNotification('notification:new', callback);
  }

  removeAllNotificationListeners() {
    if (this.notificationSocket) {
      this.notificationSocket.removeAllListeners();
    }
  }

  removeAllMainSocketListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;