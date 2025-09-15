'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Clock,
  Calendar,
  FileText,
  TrendingUp,
  Bell,
  Award,
  Video,
  MessageSquare,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  MoreVertical,
  Play
} from 'lucide-react';
import Link from 'next/link';
import ApiService from '@/services/api.service';

export default function TeacherDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('Teacher');


  useEffect(() => {
    fetchDashboardData();
    // Get user name from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.firstName || 'Teacher');
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTeacherAnalytics();
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching teacher dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardData ? {
    totalStudents: dashboardData.totalStudents || 0,
    activeClasses: dashboardData.totalSubjects || 0,
    pendingAssignments: dashboardData.pendingGrading || 0,
    todayClasses: dashboardData.todaysClasses || 0,
    totalTests: dashboardData.totalTests || 0,
    totalMaterials: dashboardData.totalMaterials || 0,
  } : {
    totalStudents: 0,
    activeClasses: 0,
    pendingAssignments: 0,
    todayClasses: 0,
    totalTests: 0,
    totalMaterials: 0,
  };

  const todaySchedule = [
    {
      id: 1,
      time: '9:00 AM',
      subject: 'Mathematics',
      class: 'Grade 10-A',
      type: 'live',
      students: 25,
      status: 'upcoming',
    },
    {
      id: 2,
      time: '10:30 AM',
      subject: 'Physics',
      class: 'Grade 11-B',
      type: 'live',
      students: 22,
      status: 'upcoming',
    },
    {
      id: 3,
      time: '2:00 PM',
      subject: 'Mathematics',
      class: 'Grade 9-C',
      type: 'recorded',
      students: 28,
      status: 'upcoming',
    },
    {
      id: 4,
      time: '4:00 PM',
      subject: 'Physics Lab',
      class: 'Grade 11-A',
      type: 'offline',
      students: 20,
      status: 'upcoming',
    },
  ];

  const recentSubmissions = [
    {
      id: 1,
      student: 'Sarah Johnson',
      assignment: 'Quadratic Equations Practice',
      subject: 'Mathematics',
      submittedAt: '2 hours ago',
      status: 'pending',
    },
    {
      id: 2,
      student: 'Mike Chen',
      assignment: 'Physics Lab Report',
      subject: 'Physics',
      submittedAt: '5 hours ago',
      status: 'graded',
      grade: 'A',
    },
    {
      id: 3,
      student: 'Emily Davis',
      assignment: 'Trigonometry Problems',
      subject: 'Mathematics',
      submittedAt: '1 day ago',
      status: 'pending',
    },
  ];

  // Use real data from API if available
  const pendingApprovals = dashboardData?.pendingApprovals || [];
  const studentPerformance = dashboardData?.studentPerformance || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600">Error: {error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h1>
            <p className="text-white/90">You have {todaySchedule.length} classes scheduled for today</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
            <p className="text-white/90">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-green-600 font-medium">+5%</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.totalStudents}</p>
          <p className="text-xs text-neutral-600">Total Students</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="h-5 w-5 text-purple-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.activeClasses}</p>
          <p className="text-xs text-neutral-600">Classes</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-5 w-5 text-orange-500" />
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.pendingAssignments}</p>
          <p className="text-xs text-neutral-600">To Review</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <span className="text-xs text-neutral-600">Today</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.todayClasses}</p>
          <p className="text-xs text-neutral-600">Classes Today</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.averageAttendance}%</p>
          <p className="text-xs text-neutral-600">Attendance</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span className="text-xs text-yellow-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.pendingPayments}</p>
          <p className="text-xs text-neutral-600">Payments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Today's Schedule</h2>
              <Link href="/teacher/classes/schedule" className="text-sm text-primary hover:text-primary/80">
                View Full Schedule
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {todaySchedule.map((class_) => (
                <div key={class_.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-neutral-500">Time</p>
                      <p className="font-semibold text-neutral-900">{class_.time}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      class_.type === 'live' ? 'bg-red-100' :
                      class_.type === 'recorded' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {class_.type === 'live' ? (
                        <Video className="h-6 w-6 text-red-600" />
                      ) : class_.type === 'recorded' ? (
                        <Play className="h-6 w-6 text-blue-600" />
                      ) : (
                        <Users className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{class_.subject}</p>
                      <p className="text-sm text-neutral-600">{class_.class} • {class_.students} students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      class_.type === 'live' ? 'bg-red-100 text-red-700' :
                      class_.type === 'recorded' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {class_.type}
                    </span>
                    {class_.type === 'live' && (
                      <button className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors">
                        Start Class
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Pending Approvals</h2>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                {pendingApprovals.length} New
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="font-medium text-neutral-900 text-sm">{approval.student}</p>
                  <p className="text-xs text-neutral-600 mt-1">{approval.class}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      approval.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      Payment: {approval.paymentStatus}
                    </span>
                    <div className="flex gap-2">
                      <button className="text-green-600 hover:text-green-700">
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <AlertCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Submissions</h2>
              <Link href="/teacher/assignments/submissions" className="text-sm text-primary hover:text-primary/80">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{submission.student}</p>
                    <p className="text-sm text-neutral-600">{submission.assignment}</p>
                    <p className="text-xs text-neutral-500 mt-1">{submission.subject} • {submission.submittedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {submission.status === 'graded' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Grade: {submission.grade}
                      </span>
                    ) : (
                      <button className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors">
                        Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Class Performance */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Class Performance</h2>
              <Link href="/teacher/reports" className="text-sm text-primary hover:text-primary/80">
                Detailed Reports
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {studentPerformance.map((perf, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 text-sm">{perf.subject}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-neutral-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${perf.average}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-neutral-900">{perf.average}%</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {perf.trend === 'up' ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 bg-neutral-300 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}