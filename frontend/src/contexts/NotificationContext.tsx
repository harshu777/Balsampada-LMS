'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import NotificationToast from '@/components/notifications/NotificationToast';

interface Notification {
  id: string;
  type: 'SYSTEM' | 'APPROVAL' | 'PAYMENT' | 'CLASS' | 'ASSIGNMENT' | 'TEST' | 'MESSAGE';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
  isRead?: boolean;
  readAt?: string;
}

interface NotificationContextType {
  // Connection state
  isConnected: boolean;
  
  // Notifications state
  notifications: Notification[];
  unreadCount: number;
  
  // Socket connection
  notificationSocket: Socket | null;
  
  // Methods
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  getRecentNotifications: (limit?: number) => void;
  clearNotifications: () => void;
  
  // Event handlers
  onNewNotification: (callback: (notification: Notification) => void) => void;
  offNewNotification: (callback: (notification: Notification) => void) => void;
  
  // Show toast notifications
  showToast: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
  
  const { token, user } = useAuth();

  // Connect to notification socket
  useEffect(() => {
    if (!token || !user) {
      // Disconnect if no token
      if (notificationSocket) {
        notificationSocket.disconnect();
        setNotificationSocket(null);
        setIsConnected(false);
        setNotifications([]);
        setUnreadCount(0);
      }
      return;
    }

    // Connect to notification namespace
    const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/notifications`, {
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

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to notification socket:', socket.id);
      setIsConnected(true);
      // Request recent notifications on connect
      socket.emit('notification:get-recent', { limit: 20 });
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from notification socket:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Notification socket connection error:', error);
      setIsConnected(false);
    });

    // Notification events
    socket.on('notification:new', (notification: Notification) => {
      console.log('New notification received:', notification);
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Show toast
      showToast(notification);
    });

    socket.on('notification:unread-count', ({ count }: { count: number }) => {
      console.log('Unread count updated:', count);
      setUnreadCount(count);
    });

    socket.on('notification:recent-list', ({ notifications: recentNotifications }: { notifications: Notification[] }) => {
      console.log('Recent notifications received:', recentNotifications);
      setNotifications(recentNotifications);
    });

    socket.on('notification:all-marked-read', () => {
      console.log('All notifications marked as read');
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    });

    socket.on('error', (error: { message: string }) => {
      console.error('Notification socket error:', error);
    });

    setNotificationSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    if (notificationSocket?.connected) {
      notificationSocket.emit('notification:mark-read', { notificationId });
      
      // Optimistic update
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notificationSocket]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    if (notificationSocket?.connected) {
      notificationSocket.emit('notification:mark-all-read');
    }
  }, [notificationSocket]);

  // Get recent notifications
  const getRecentNotifications = useCallback((limit = 20) => {
    if (notificationSocket?.connected) {
      notificationSocket.emit('notification:get-recent', { limit });
    }
  }, [notificationSocket]);

  // Clear all notifications from state
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Show toast notification
  const showToast = useCallback((notification: Notification) => {
    setToastNotifications(prev => [...prev, notification]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToastNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  // Event handlers for components
  const onNewNotification = useCallback((callback: (notification: Notification) => void) => {
    if (notificationSocket) {
      notificationSocket.on('notification:new', callback);
    }
  }, [notificationSocket]);

  const offNewNotification = useCallback((callback: (notification: Notification) => void) => {
    if (notificationSocket) {
      notificationSocket.off('notification:new', callback);
    }
  }, [notificationSocket]);

  const value: NotificationContextType = {
    isConnected,
    notifications,
    unreadCount,
    notificationSocket,
    markAsRead,
    markAllAsRead,
    getRecentNotifications,
    clearNotifications,
    onNewNotification,
    offNewNotification,
    showToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastNotifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => {
              setToastNotifications(prev => prev.filter(n => n.id !== notification.id));
            }}
            onRead={() => markAsRead(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};