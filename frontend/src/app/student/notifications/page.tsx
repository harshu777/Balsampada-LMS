'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Search, CheckCheck, BookOpen, Calendar, DollarSign, MessageCircle, FileText, Users } from 'lucide-react';
import ApiService from '@/services/api.service';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYSTEM' | 'PAYMENT' | 'CLASS' | 'ASSIGNMENT' | 'TEST' | 'MESSAGE';
  read: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      // Create mock data for student notifications
      setNotifications([
        {
          id: '1',
          title: 'New Assignment Posted',
          message: 'Mathematics assignment "Quadratic Equations" is due on Friday',
          type: 'ASSIGNMENT',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Class Tomorrow',
          message: 'Physics class scheduled for 10:00 AM tomorrow',
          type: 'CLASS',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          title: 'Test Results Available',
          message: 'Your Chemistry mid-term test results have been published',
          type: 'TEST',
          read: true,
          createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '4',
          title: 'Payment Reminder',
          message: 'Monthly fee payment of ₹5000 is due by end of this week',
          type: 'PAYMENT',
          read: false,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '5',
          title: 'New Message from Teacher',
          message: 'Mr. Anderson sent you a message about your assignment',
          type: 'MESSAGE',
          read: true,
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '6',
          title: 'Attendance Update',
          message: 'Your attendance for this month is 85%',
          type: 'INFO',
          read: true,
          createdAt: new Date(Date.now() - 259200000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await ApiService.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Update locally for demo
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Update locally for demo
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await ApiService.clearNotifications();
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Update locally for demo
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT':
        return <FileText className="h-5 w-5 text-pink-600" />;
      case 'CLASS':
        return <Users className="h-5 w-5 text-purple-600" />;
      case 'TEST':
        return <BookOpen className="h-5 w-5 text-indigo-600" />;
      case 'PAYMENT':
        return <DollarSign className="h-5 w-5 text-blue-600" />;
      case 'MESSAGE':
        return <MessageCircle className="h-5 w-5 text-cyan-600" />;
      case 'SUCCESS':
        return <Check className="h-5 w-5 text-green-600" />;
      case 'WARNING':
        return <Bell className="h-5 w-5 text-yellow-600" />;
      case 'ERROR':
        return <Bell className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'PAYMENT': return 'bg-blue-100 text-blue-800';
      case 'CLASS': return 'bg-purple-100 text-purple-800';
      case 'TEST': return 'bg-indigo-100 text-indigo-800';
      case 'ASSIGNMENT': return 'bg-pink-100 text-pink-800';
      case 'MESSAGE': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    if (selectedType !== 'all' && notification.type !== selectedType) return false;
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">My Notifications</h1>
              <p className="text-sm text-neutral-600 mt-1">
                {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Read
            </button>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="CLASS">Classes</option>
            <option value="ASSIGNMENT">Assignments</option>
            <option value="TEST">Tests</option>
            <option value="PAYMENT">Payments</option>
            <option value="MESSAGE">Messages</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-neutral-600">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-600">No notifications found</p>
            <p className="text-sm text-neutral-500 mt-1">
              {filter === 'unread' ? 'You have no unread notifications' : 
               filter === 'read' ? 'You have no read notifications' :
               'Your notification inbox is empty'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-neutral-50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-blue-50/30' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-neutral-100 rounded-lg">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-neutral-900">
                            {notification.title}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600">
                          {notification.message}
                        </p>
                        <p className="text-xs text-neutral-500 mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-2 text-neutral-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <DollarSign className="h-8 w-8 mb-2" />
          <h3 className="font-semibold">Payment Due</h3>
          <p className="text-sm opacity-90 mt-1">Check your pending payments</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <Calendar className="h-8 w-8 mb-2" />
          <h3 className="font-semibold">Upcoming Classes</h3>
          <p className="text-sm opacity-90 mt-1">View your class schedule</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 rounded-lg text-white">
          <FileText className="h-8 w-8 mb-2" />
          <h3 className="font-semibold">Pending Assignments</h3>
          <p className="text-sm opacity-90 mt-1">Submit your assignments</p>
        </div>
      </div>
    </div>
  );
}