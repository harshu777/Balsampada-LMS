'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, X, Filter, Trash2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationToast from './NotificationToast';

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

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    getRecentNotifications,
    isConnected,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      getRecentNotifications(50);
    }
  }, [isOpen, getRecentNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleSelectNotification = (notificationId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedNotifications);
    if (isSelected) {
      newSelected.add(notificationId);
    } else {
      newSelected.delete(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      PAYMENT: 'text-green-600 bg-green-100',
      CLASS: 'text-blue-600 bg-blue-100',
      ASSIGNMENT: 'text-orange-600 bg-orange-100',
      TEST: 'text-purple-600 bg-purple-100',
      MESSAGE: 'text-indigo-600 bg-indigo-100',
      APPROVAL: 'text-emerald-600 bg-emerald-100',
      SYSTEM: 'text-gray-600 bg-gray-100',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-25 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={isConnected ? 'Connected' : 'Disconnected'} />
              
              <button
                onClick={onClose}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="border-b px-4 py-2">
            <div className="flex items-center justify-between">
              {/* Filters */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded border-gray-300 text-sm"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="PAYMENT">Payments</option>
                  <option value="CLASS">Classes</option>
                  <option value="ASSIGNMENT">Assignments</option>
                  <option value="TEST">Tests</option>
                  <option value="MESSAGE">Messages</option>
                  <option value="SYSTEM">System</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center space-x-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                <div className="text-center">
                  <Bell className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2">No notifications</p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <div className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                          
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <Check className="h-3 w-3" />
                              <span>Mark read</span>
                            </button>
                          )}
                        </div>
                        
                        {/* Additional data for specific notification types */}
                        {notification.type === 'PAYMENT' && notification.data && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <div className="flex justify-between">
                              <span>Amount: ₹{notification.data.amount}</span>
                              <span className={`font-medium ${notification.data.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}`}>
                                {notification.data.status}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {notification.type === 'CLASS' && notification.data?.meetingUrl && (
                          <div className="mt-2">
                            <a
                              href={notification.data.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                            >
                              Join Class
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Showing {filteredNotifications.length} notifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;