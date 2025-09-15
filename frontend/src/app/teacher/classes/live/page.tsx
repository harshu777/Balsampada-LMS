'use client';

import React, { useState, useEffect } from 'react';
import { 
  VideoCameraIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  PlayIcon,
  StopIcon,
  MicrophoneIcon,
  ComputerDesktopIcon,
  LinkIcon,
  PlusIcon,
  ArrowRightIcon,
  SignalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface LiveClass {
  id: string;
  title: string;
  subject: {
    id: string;
    name: string;
    class: {
      id: string;
      name: string;
    };
  };
  startTime: string;
  endTime: string;
  meetingUrl?: string;
  description?: string;
  isActive: boolean;
  _count?: {
    attendees: number;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Subject {
  id: string;
  name: string;
  class: {
    id: string;
    name: string;
  };
}

export default function LiveClassesPage() {
  const { user, loading: authLoading } = useAuth();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    meetingUrl: ''
  });

  // Fetch live sessions and subjects only when user is loaded
  useEffect(() => {
    if (!authLoading && user) {
      fetchLiveSessions();
      fetchSubjects();
    } else if (!authLoading && !user) {
      // Only redirect if auth is loaded and no user
      window.location.href = '/login';
    }
  }, [authLoading, user]);

  const fetchLiveSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3001/api/live-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        console.error('Session expired');
        toast.error('Session expired. Please login again');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setLiveClasses(data);
      }
    } catch (error) {
      console.error('Error fetching live sessions:', error);
      toast.error('Failed to load live sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3001/api/subjects/my-subjects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        console.log('Unauthorized - token might be expired');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Subjects API response:', data);
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subjectId || !formData.title || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/live-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Live session scheduled successfully');
        setShowCreateModal(false);
        setFormData({
          subjectId: '',
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          meetingUrl: ''
        });
        fetchLiveSessions();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to schedule session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to schedule session');
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/live-sessions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Session deleted successfully');
        fetchLiveSessions();
      } else {
        toast.error('Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  // Mock data for demonstration (remove this after API integration)
  useEffect(() => {
    if (liveClasses.length === 0 && !loading) {
      const mockClasses: any[] = [
      ];
      // Uncomment to use mock data for testing
      // setLiveClasses(mockClasses);
    }
  }, [liveClasses, loading]);

  const filteredClasses = liveClasses.filter(cls => {
    if (filter === 'all') return true;
    const now = new Date();
    const startTime = new Date(cls.startTime);
    if (filter === 'upcoming') return startTime > now;
    if (filter === 'past') return startTime <= now;
    return true;
  });

  const getSessionStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return 'scheduled';
    if (now >= start && now <= end) return 'live';
    return 'completed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-600">
            {authLoading ? 'Checking authentication...' : 'Loading live classes...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Live Classes</h1>
          <p className="text-neutral-600 mt-1">Manage and conduct your online classes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Schedule Live Class
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <SignalIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Live Now</p>
              <p className="text-2xl font-bold text-neutral-900">
                {liveClasses.filter(c => {
                  const status = getSessionStatus(c.startTime, c.endTime);
                  return status === 'live';
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Upcoming</p>
              <p className="text-2xl font-bold text-neutral-900">
                {liveClasses.filter(c => {
                  const status = getSessionStatus(c.startTime, c.endTime);
                  return status === 'scheduled';
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <VideoCameraIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-600">Completed</p>
              <p className="text-2xl font-bold text-neutral-900">
                {liveClasses.filter(c => {
                  const status = getSessionStatus(c.startTime, c.endTime);
                  return status === 'completed';
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-neutral-200 p-1 inline-flex">
        {(['all', 'upcoming', 'past'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md capitalize transition-colors ${
              filter === status 
                ? 'bg-primary text-white' 
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {status === 'all' ? 'All Sessions' : status}
          </button>
        ))}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <VideoCameraIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600">No {filter !== 'all' ? filter : ''} sessions found</p>
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const status = getSessionStatus(cls.startTime, cls.endTime);
            return (
              <div key={cls.id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Status Badge */}
                <div className={`px-4 py-2 border-b ${getStatusColor(status)}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize flex items-center gap-2">
                      {status === 'live' && <SignalIcon className="h-4 w-4 animate-pulse" />}
                      {status}
                    </span>
                  </div>
                </div>

                {/* Class Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-lg">{cls.title}</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      {cls.subject.name} • {cls.subject.class.name}
                    </p>
                    {cls.description && (
                      <p className="text-sm text-neutral-500 mt-2">{cls.description}</p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <CalendarIcon className="h-4 w-4" />
                      {format(new Date(cls.startTime), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <ClockIcon className="h-4 w-4" />
                      {format(new Date(cls.startTime), 'hh:mm a')} - {format(new Date(cls.endTime), 'hh:mm a')}
                    </div>
                    {cls._count && (
                      <div className="flex items-center gap-2 text-neutral-600">
                        <UsersIcon className="h-4 w-4" />
                        {cls._count.attendees} attendees
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 space-y-2">
                    {status === 'scheduled' && (
                      <>
                        {cls.meetingUrl && (
                          <a
                            href={cls.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <LinkIcon className="h-4 w-4" />
                              Open Meeting Link
                            </span>
                          </a>
                        )}
                        <button 
                          onClick={() => handleDeleteSession(cls.id)}
                          className="w-full px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                          Cancel Session
                        </button>
                      </>
                    )}
                    
                    {status === 'live' && cls.meetingUrl && (
                      <a
                        href={cls.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <ArrowRightIcon className="h-4 w-4" />
                          Join Live
                        </span>
                      </a>
                    )}
                    
                    {status === 'completed' && (
                      <button className="w-full px-4 py-2 border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Schedule Live Session</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    subjectId: '',
                    title: '',
                    description: '',
                    startTime: '',
                    endTime: '',
                    meetingUrl: ''
                  });
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} - {subject.class.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Session Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Chapter 5 - Derivatives"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Brief description of the session"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Meeting URL
                </label>
                <input
                  type="url"
                  value={formData.meetingUrl}
                  onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://meet.google.com/abc-defg-hij"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      subjectId: '',
                      title: '',
                      description: '',
                      startTime: '',
                      endTime: '',
                      meetingUrl: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}