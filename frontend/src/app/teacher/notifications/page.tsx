'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Search, CheckCheck, Users, Calendar, FileText, MessageCircle, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
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

export default function TeacherNotificationsPage() {
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
      // Create mock data for teacher notifications
      setNotifications([
        {
          id: '1',
          title: 'Assignment Submissions',
          message: '15 students submitted their Mathematics assignments',
          type: 'ASSIGNMENT',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Class Reminder',
          message: 'Physics class scheduled in 30 minutes - 25 students enrolled',
          type: 'CLASS',
          read: false,
          createdAt: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '3',
          title: 'Test Grading Pending',
          message: '8 Chemistry test papers pending for grading',
          type: 'TEST',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '4',
          title: 'Low Attendance Alert',
          message: '3 students have attendance below 75% in your Mathematics class',
          type: 'WARNING',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '5',
          title: 'New Student Enrolled',
          message: 'Jane Smith has enrolled in your Physics class',
          type: 'SYSTEM',
          read: true,
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '6',
          title: 'Message from Student',
          message: 'Sarah Johnson asked a question about the assignment',
          type: 'MESSAGE',
          read: false,
          createdAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: '7',
          title: 'Performance Report',
          message: 'Monthly performance report for your classes is ready',
          type: 'INFO',
          read: true,
          createdAt: new Date(Date.now() - 345600000).toISOString()
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
        return <Clock className="h-5 w-5 text-indigo-600" />;
      case 'MESSAGE':
        return <MessageCircle className="h-5 w-5 text-cyan-600" />;
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'ERROR':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'SYSTEM':
        return <Bell className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'CLASS': return 'bg-purple-100 text-purple-800';
      case 'TEST': return 'bg-indigo-100 text-indigo-800';
      case 'ASSIGNMENT': return 'bg-pink-100 text-pink-800';
      case 'MESSAGE': return 'bg-cyan-100 text-cyan-800';
      case 'SYSTEM': return 'bg-blue-100 text-blue-800';
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
  const pendingTasks = notifications.filter(n => !n.read && (n.type === 'ASSIGNMENT' || n.type === 'TEST')).length;

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
              <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
              <p className="text-sm text-neutral-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All notifications read'} 
                {pendingTasks > 0 && ` • ${pendingTasks} pending tasks`}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Classes Today</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-1">3</p>
          </div>
          <div className="bg-pink-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium text-pink-900">Pending Grading</span>
            </div>
            <p className="text-2xl font-bold text-pink-600 mt-1">8</p>
          </div>
          <div className="bg-cyan-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-cyan-600" />
              <span className="text-sm font-medium text-cyan-900">New Messages</span>
            </div>
            <p className="text-2xl font-bold text-cyan-600 mt-1">2</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Alerts</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-1">1</p>
          </div>
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
            <option value="MESSAGE">Messages</option>
            <option value="SYSTEM">System</option>
            <option value="WARNING">Alerts</option>
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
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' :
               'Your notification inbox is empty'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-neutral-50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-blue-50/30 border-l-4 border-primary' : ''
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
                            <span className="text-xs font-medium text-primary">NEW</span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-xs text-neutral-500">
                            {formatTime(notification.createdAt)}
                          </p>
                          {(notification.type === 'ASSIGNMENT' || notification.type === 'TEST') && !notification.read && (
                            <button className="text-xs text-primary font-medium hover:underline">
                              View Details →
                            </button>
                          )}
                        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="bg-white border border-neutral-200 p-4 rounded-lg hover:shadow-md transition-shadow text-left">
          <Calendar className="h-6 w-6 text-purple-600 mb-2" />
          <h3 className="font-semibold text-neutral-900">Today's Classes</h3>
          <p className="text-sm text-neutral-600 mt-1">View schedule</p>
        </button>
        <button className="bg-white border border-neutral-200 p-4 rounded-lg hover:shadow-md transition-shadow text-left">
          <FileText className="h-6 w-6 text-pink-600 mb-2" />
          <h3 className="font-semibold text-neutral-900">Grade Assignments</h3>
          <p className="text-sm text-neutral-600 mt-1">8 pending</p>
        </button>
        <button className="bg-white border border-neutral-200 p-4 rounded-lg hover:shadow-md transition-shadow text-left">
          <MessageCircle className="h-6 w-6 text-cyan-600 mb-2" />
          <h3 className="font-semibold text-neutral-900">Student Messages</h3>
          <p className="text-sm text-neutral-600 mt-1">2 unread</p>
        </button>
        <button className="bg-white border border-neutral-200 p-4 rounded-lg hover:shadow-md transition-shadow text-left">
          <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
          <h3 className="font-semibold text-neutral-900">Performance</h3>
          <p className="text-sm text-neutral-600 mt-1">View reports</p>
        </button>
      </div>
    </div>
  );
}