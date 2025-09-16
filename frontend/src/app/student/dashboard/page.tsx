'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  Calendar,
  FileText,
  TrendingUp,
  Bell,
  Award,
  Video,
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
  BarChart,
  Target,
  ArrowRight,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import ApiService from '@/services/api.service';

export default function StudentDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    fetchDashboardData();
    // Get user name from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.firstName || 'Student');
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getDashboardStats();
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching student dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardData ? {
    enrolledClasses: dashboardData.totalSubjects || 0,
    completedLessons: dashboardData.completedAssignments || 0,
    pendingAssignments: dashboardData.pendingAssignments || 0,
    averageGrade: dashboardData.averageGrade || 0,
    attendance: dashboardData.attendancePercentage || 0,
    upcomingTests: dashboardData.upcomingTests || 0,
    nextClass: '2 hours',
  } : {
    enrolledClasses: 0,
    completedLessons: 0,
    pendingAssignments: 0,
    averageGrade: 0,
    attendance: 0,
    upcomingTests: 0,
    nextClass: '2 hours',
  };

  const upcomingClasses = [
    {
      id: 1,
      subject: 'Mathematics',
      teacher: 'Mr. John Anderson',
      time: '10:00 AM',
      date: 'Today',
      type: 'live',
      topic: 'Quadratic Equations',
      duration: '1 hour',
    },
    {
      id: 2,
      subject: 'Physics',
      teacher: 'Ms. Sarah Johnson',
      time: '2:00 PM',
      date: 'Today',
      type: 'live',
      topic: 'Newton\'s Laws of Motion',
      duration: '1.5 hours',
    },
    {
      id: 3,
      subject: 'Chemistry',
      teacher: 'Dr. Michael Chen',
      time: '10:00 AM',
      date: 'Tomorrow',
      type: 'recorded',
      topic: 'Organic Chemistry Basics',
      duration: '45 mins',
    },
  ];

  // Use real data from API
  const pendingAssignments = dashboardData?.pendingAssignments || [];
  const recentGrades = dashboardData?.recentGrades || [];
  const studyMaterials = dashboardData?.recentMaterials || [];

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

  const studyMaterialsDisplay = studyMaterials.length ? studyMaterials : [
    {
      id: 1,
      title: 'Mathematics Formula Sheet',
      subject: 'Mathematics',
      type: 'pdf',
      size: '2.5 MB',
      uploadedBy: 'Mr. John Anderson',
      uploadedAt: '2 days ago',
    },
    {
      id: 2,
      title: 'Physics Video Lecture - Chapter 3',
      subject: 'Physics',
      type: 'video',
      duration: '45 mins',
      uploadedBy: 'Ms. Sarah Johnson',
      uploadedAt: '3 days ago',
    },
    {
      id: 3,
      title: 'Chemistry Notes - Organic Compounds',
      subject: 'Chemistry',
      type: 'pdf',
      size: '1.8 MB',
      uploadedBy: 'Dr. Michael Chen',
      uploadedAt: '1 week ago',
    },
  ];

  const paymentStatus = {
    currentMonth: 'paid',
    nextDue: '2024-02-01',
    amount: 5000,
    pendingAmount: 0,
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return 'text-green-600 bg-green-100';
    if (grade.includes('B')) return 'text-blue-600 bg-blue-100';
    if (grade.includes('C')) return 'text-yellow-600 bg-yellow-100';
    return 'text-neutral-600 bg-neutral-100';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h1>
            <p className="text-white/90">You have {upcomingClasses.filter(c => c.date === 'Today').length} classes today. Keep up the great work!</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80 mb-1">Next class in</p>
            <p className="text-3xl font-bold">{stats.nextClass}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.enrolledClasses}</p>
          <p className="text-xs text-neutral-600">Enrolled Classes</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-xs text-green-600">+12%</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.completedLessons}</p>
          <p className="text-xs text-neutral-600">Completed</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-5 w-5 text-orange-500" />
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.pendingAssignments}</p>
          <p className="text-xs text-neutral-600">Pending Tasks</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-5 w-5 text-purple-500" />
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.averageGrade}%</p>
          <p className="text-xs text-neutral-600">Avg. Grade</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-indigo-500" />
            <span className="text-xs text-green-600">Good</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.attendance}%</p>
          <p className="text-xs text-neutral-600">Attendance</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">Paid</p>
          <p className="text-xs text-neutral-600">Fee Status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Upcoming Classes</h2>
              <Link href="/student/classes" className="text-sm text-primary hover:text-primary/80">
                View Schedule
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingClasses.map((class_: any) => (
                <div key={class_.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      class_.type === 'live' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {class_.type === 'live' ? (
                        <Video className="h-6 w-6 text-red-600" />
                      ) : (
                        <Play className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{class_.subject}</p>
                      <p className="text-sm text-neutral-600">{class_.topic}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {class_.teacher} • {class_.date} at {class_.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">{class_.duration}</span>
                    {class_.type === 'live' && class_.date === 'Today' && (
                      <button className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors">
                        Join Class
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Pending Assignments</h2>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                {pendingAssignments.length} Due
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingAssignments.map((assignment: any) => (
                <div key={assignment.id} className="p-3 border border-neutral-200 rounded-lg">
                  <p className="font-medium text-neutral-900 text-sm">{assignment.title}</p>
                  <p className="text-xs text-neutral-600 mt-1">{assignment.subject}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs font-medium ${
                      assignment.daysLeft <= 2 ? 'text-red-600' : 
                      assignment.daysLeft <= 5 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {assignment.daysLeft} days left
                    </span>
                    <button className="text-xs text-primary hover:text-primary/80">
                      Start →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Grades</h2>
              <Link href="/student/grades" className="text-sm text-primary hover:text-primary/80">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentGrades.map((grade: any) => (
                <div key={grade.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 text-sm">{grade.assessment}</p>
                    <p className="text-xs text-neutral-600 mt-1">{grade.subject} • {grade.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-900">{grade.score}/{grade.total}</p>
                      <p className="text-xs text-neutral-600">{grade.percentage}%</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(grade.grade)}`}>
                      {grade.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Study Materials */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Study Materials</h2>
              <Link href="/student/materials" className="text-sm text-primary hover:text-primary/80">
                View Library
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {studyMaterials.map((material: any) => (
                <div key={material.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      material.type === 'pdf' ? 'bg-red-100' : 'bg-purple-100'
                    }`}>
                      {material.type === 'pdf' ? (
                        <FileText className="h-5 w-5 text-red-600" />
                      ) : (
                        <Video className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">{material.title}</p>
                      <p className="text-xs text-neutral-600">
                        {material.subject} • {material.type === 'pdf' ? material.size : material.duration}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-neutral-600 hover:text-primary transition-colors">
                    {material.type === 'pdf' ? (
                      <Download className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}