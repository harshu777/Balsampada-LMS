'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Bell, CreditCard, BookOpen, FileText, BarChart3, MessageSquare, AlertCircle } from 'lucide-react';

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

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onRead?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ 
  notification, 
  onClose, 
  onRead,
  autoClose = true,
  autoCloseDelay = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!autoClose) return;

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, autoCloseDelay - elapsed);
      const progressPercent = (remaining / autoCloseDelay) * 100;
      setProgress(progressPercent);
    }, 50);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
        clearInterval(progressInterval);
      }, 300);
    }, autoCloseDelay);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [autoClose, autoCloseDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleMarkRead = () => {
    if (onRead) {
      onRead();
    }
  };

  const getNotificationConfig = (type: Notification['type']) => {
    switch (type) {
      case 'PAYMENT':
        return {
          icon: <CreditCard className="h-5 w-5" />,
          color: 'border-l-green-500 bg-green-50',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900',
        };
      case 'CLASS':
        return {
          icon: <BookOpen className="h-5 w-5" />,
          color: 'border-l-blue-500 bg-blue-50',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
        };
      case 'ASSIGNMENT':
        return {
          icon: <FileText className="h-5 w-5" />,
          color: 'border-l-orange-500 bg-orange-50',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-900',
        };
      case 'TEST':
        return {
          icon: <BarChart3 className="h-5 w-5" />,
          color: 'border-l-purple-500 bg-purple-50',
          iconColor: 'text-purple-600',
          titleColor: 'text-purple-900',
        };
      case 'MESSAGE':
        return {
          icon: <MessageSquare className="h-5 w-5" />,
          color: 'border-l-indigo-500 bg-indigo-50',
          iconColor: 'text-indigo-600',
          titleColor: 'text-indigo-900',
        };
      case 'APPROVAL':
        return {
          icon: <Check className="h-5 w-5" />,
          color: 'border-l-emerald-500 bg-emerald-50',
          iconColor: 'text-emerald-600',
          titleColor: 'text-emerald-900',
        };
      case 'SYSTEM':
      default:
        return {
          icon: <Bell className="h-5 w-5" />,
          color: 'border-l-gray-500 bg-gray-50',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-900',
        };
    }
  };

  const config = getNotificationConfig(notification.type);

  return (
    <div
      className={`
        max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 border-l-4 overflow-hidden
        ${config.color}
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      {/* Progress bar */}
      {autoClose && (
        <div className="h-1 bg-gray-200">
          <div 
            className="h-1 bg-blue-500 transition-all duration-[50ms] ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 ${config.iconColor} mr-3`}>
            {config.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${config.titleColor}`}>
              {notification.title}
            </p>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <span className="mr-1">🕐</span>
              {new Date(notification.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex-shrink-0 ml-4 flex items-center space-x-2">
            {/* Mark as read button */}
            {onRead && !notification.isRead && (
              <button
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                onClick={handleMarkRead}
                title="Mark as read"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
            
            {/* Close button */}
            <button
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              onClick={handleClose}
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Additional data display */}
        {notification.data && notification.type === 'PAYMENT' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Amount: ₹{notification.data.amount}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                notification.data.status === 'APPROVED' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {notification.data.status}
              </span>
            </div>
          </div>
        )}
        
        {notification.data && notification.type === 'CLASS' && notification.data.meetingUrl && (
          <div className="mt-3">
            <a
              href={notification.data.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
            >
              Join Class
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationToast;