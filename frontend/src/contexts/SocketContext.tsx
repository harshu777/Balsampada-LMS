'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface User {
  userId: string;
  email: string;
  role: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  // Connection methods
  connect: () => void;
  disconnect: () => void;
  // User presence
  emitTypingStart: (roomId: string, userName: string) => void;
  emitTypingStop: (roomId: string) => void;
  // Class management
  joinClass: (classId: string) => void;
  leaveClass: (classId: string) => void;
  // Event listeners
  onUserOnline: (callback: (user: User) => void) => void;
  onUserOffline: (callback: (user: User) => void) => void;
  onTypingStart: (callback: (data: { userId: string; userName: string; roomId: string }) => void) => void;
  onTypingStop: (callback: (data: { userId: string; roomId: string }) => void) => void;
  onClassUserJoined: (callback: (data: { userId: string; userEmail: string; userRole: string; classId: string }) => void) => void;
  onClassUserLeft: (callback: (data: { userId: string; userEmail: string; classId: string }) => void) => void;
  onBroadcastMessage: (callback: (message: any) => void) => void;
  // Cleanup
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  // Get token from localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    setToken(accessToken);
  }, [user]);

  const connect = useCallback(() => {
    if (!token || socket?.connected) return;

    console.log('Connecting to Socket.IO server...');
    
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
    });

    // User presence events
    newSocket.on('user:online', (userData: User) => {
      console.log('User came online:', userData);
    });

    newSocket.on('user:offline', (userData: User) => {
      console.log('User went offline:', userData);
    });

    newSocket.on('users:online', (userIds: string[]) => {
      console.log('Online users:', userIds);
      setOnlineUsers(userIds);
    });

    // Reconnection handlers
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to Socket.IO server after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Socket.IO reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed');
      setIsConnected(false);
    });

    setSocket(newSocket);
  }, [token]);

  const disconnect = useCallback(() => {
    if (socket) {
      console.log('Disconnecting from Socket.IO server...');
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
    }
  }, [socket]);

  // Auto-connect when token is available
  useEffect(() => {
    if (token && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token, user, connect, disconnect]);

  // Typing events
  const emitTypingStart = useCallback((roomId: string, userName: string) => {
    if (socket?.connected) {
      socket.emit('typing:start', { roomId, userName });
    }
  }, [socket]);

  const emitTypingStop = useCallback((roomId: string) => {
    if (socket?.connected) {
      socket.emit('typing:stop', { roomId });
    }
  }, [socket]);

  // Class events
  const joinClass = useCallback((classId: string) => {
    if (socket?.connected) {
      socket.emit('class:join', { classId });
    }
  }, [socket]);

  const leaveClass = useCallback((classId: string) => {
    if (socket?.connected) {
      socket.emit('class:leave', { classId });
    }
  }, [socket]);

  // Event listeners
  const onUserOnline = useCallback((callback: (user: User) => void) => {
    if (socket) {
      socket.on('user:online', callback);
    }
  }, [socket]);

  const onUserOffline = useCallback((callback: (user: User) => void) => {
    if (socket) {
      socket.on('user:offline', callback);
    }
  }, [socket]);

  const onTypingStart = useCallback((callback: (data: { userId: string; userName: string; roomId: string }) => void) => {
    if (socket) {
      socket.on('typing:start', callback);
    }
  }, [socket]);

  const onTypingStop = useCallback((callback: (data: { userId: string; roomId: string }) => void) => {
    if (socket) {
      socket.on('typing:stop', callback);
    }
  }, [socket]);

  const onClassUserJoined = useCallback((callback: (data: { userId: string; userEmail: string; userRole: string; classId: string }) => void) => {
    if (socket) {
      socket.on('class:user-joined', callback);
    }
  }, [socket]);

  const onClassUserLeft = useCallback((callback: (data: { userId: string; userEmail: string; classId: string }) => void) => {
    if (socket) {
      socket.on('class:user-left', callback);
    }
  }, [socket]);

  const onBroadcastMessage = useCallback((callback: (message: any) => void) => {
    if (socket) {
      socket.on('broadcast:message', callback);
    }
  }, [socket]);

  // Cleanup event listeners
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    connect,
    disconnect,
    emitTypingStart,
    emitTypingStop,
    joinClass,
    leaveClass,
    onUserOnline,
    onUserOffline,
    onTypingStart,
    onTypingStop,
    onClassUserJoined,
    onClassUserLeft,
    onBroadcastMessage,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};