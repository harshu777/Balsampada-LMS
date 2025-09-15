'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Filter,
  Search,
  Eye,
  Bell,
  Award,
  BookOpen,
  Target,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { attendanceService } from '@/services/attendance.service';

export default function AdminAttendancePage() {
  const [attendanceStats, setAttendanceStats] = useState({
    totalSessions: 0,
    totalStudents: 0,
    averageAttendance: 0,
    lowAttendanceStudents: 0
  });
  const [attendanceAlerts, setAttendanceAlerts] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [classStats, setClassStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchAttendanceAlerts();
    fetchRecentAttendance();
  }, [selectedPeriod, selectedClass]);

  const fetchDashboardData = async () => {
    try {
      const query: any = {};
      if (selectedClass) query.classId = selectedClass;
      
      // Set date range based on period
      if (selectedPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query.startDate = weekAgo.toISOString();
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query.startDate = monthAgo.toISOString();
      }

      const response = await attendanceService.getAttendanceStats(query);
      if (response.status === 'success') {
        const data = response.data;
        setAttendanceStats({
          totalSessions: data.totalSessions,
          totalStudents: 150, // This would come from actual student count
          averageAttendance: data.attendancePercentage,
          lowAttendanceStudents: 12 // This would be calculated
        });
      }

      // Fetch class-wise stats (mock data for now)
      setClassStats([
        {
          id: '1',
          name: 'Grade 10-A Mathematics',
          totalStudents: 25,
          averageAttendance: 92,
          totalSessions: 48,
          trend: 'up'
        },
        {
          id: '2',
          name: 'Grade 11-B Physics',
          totalStudents: 22,
          averageAttendance: 85,
          totalSessions: 42,
          trend: 'stable'
        },
        {
          id: '3',
          name: 'Grade 9-C Mathematics',
          totalStudents: 28,
          averageAttendance: 78,
          totalSessions: 36,
          trend: 'down'
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchAttendanceAlerts = async () => {
    try {
      const response = await attendanceService.getAttendanceAlerts();
      if (response.status === 'success') {
        setAttendanceAlerts(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendance alerts:', error);
    }
  };

  const fetchRecentAttendance = async () => {
    try {
      const query: any = { limit: 50 };
      if (selectedClass) query.classId = selectedClass;

      const response = await attendanceService.getAttendance(query);
      if (response.status === 'success') {
        setRecentAttendance(response.data.attendance);
      }
    } catch (error) {
      console.error('Error fetching recent attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAllAttendance = async () => {
    try {
      const response = await attendanceService.getAttendance({ limit: 10000 });
      if (response.status === 'success' && response.data.attendance.length > 0) {
        attendanceService.exportToCSV(response.data.attendance, 'all-attendance-report');
      }
    } catch (error) {
      console.error('Error exporting attendance:', error);
    }
  };

  const filteredRecentAttendance = recentAttendance.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.session.subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Attendance Overview</h1>
          <p className="text-neutral-600">Monitor and analyze attendance across all classes and students</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportAllAttendance}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export All
          </button>
          <Link
            href="/admin/reports/attendance"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Detailed Reports
          </Link>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">Period:</span>
          {['week', 'month', 'semester', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-sm rounded-lg capitalize ${
                selectedPeriod === period
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        
        <select
          className="px-3 py-1 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">All Classes</option>
          <option value="1">Grade 10-A Mathematics</option>
          <option value="2">Grade 11-B Physics</option>
          <option value="3">Grade 9-C Mathematics</option>
        </select>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 text-blue-500" />
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{attendanceStats.totalSessions}</p>
          <p className="text-sm text-neutral-600">Total Sessions</p>
          <p className="text-xs text-green-600 mt-1">+12% from last month</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-purple-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{attendanceStats.totalStudents}</p>
          <p className="text-sm text-neutral-600">Total Students</p>
          <p className="text-xs text-blue-600 mt-1">Across all classes</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <UserCheck className="h-8 w-8 text-green-500" />
            {attendanceStats.averageAttendance >= 85 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className="text-2xl font-bold text-green-600">{attendanceStats.averageAttendance}%</p>
          <p className="text-sm text-neutral-600">Average Attendance</p>
          <p className="text-xs text-green-600 mt-1">Above target (75%)</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <Bell className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{attendanceStats.lowAttendanceStudents}</p>
          <p className="text-sm text-neutral-600">Low Attendance</p>
          <p className="text-xs text-red-600 mt-1">Needs attention</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class-wise Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Class Performance</h2>
              <Link href="/admin/classes" className="text-sm text-primary hover:text-primary/80">
                Manage Classes
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {classStats.map((classItem) => (
                <div key={classItem.id} className="p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-neutral-900">{classItem.name}</p>
                      <p className="text-sm text-neutral-600">
                        {classItem.totalStudents} students • {classItem.totalSessions} sessions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        classItem.averageAttendance >= 85 ? 'text-green-600' :
                        classItem.averageAttendance >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {classItem.averageAttendance}%
                      </p>
                      <div className="flex items-center gap-1">
                        {classItem.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : classItem.trend === 'down' ? (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        ) : (
                          <div className="h-3 w-3 bg-neutral-400 rounded-full" />
                        )}
                        <span className="text-xs text-neutral-500">
                          {classItem.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-neutral-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          classItem.averageAttendance >= 85 ? 'bg-green-500' :
                          classItem.averageAttendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${classItem.averageAttendance}%` }}
                      />
                    </div>
                    <Link
                      href={`/admin/attendance/class/${classItem.id}`}
                      className="text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Alerts */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Attendance Alerts</h2>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                {attendanceAlerts.length} Critical
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attendanceAlerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-red-900">
                        {alert.firstName} {alert.lastName}
                      </p>
                      <p className="text-xs text-red-700">{alert.subjectName}</p>
                      <p className="text-xs text-red-600 mt-1">
                        {alert.attendancePercentage}% attendance ({alert.attendedSessions}/{alert.totalSessions})
                      </p>
                    </div>
                    <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Link
                      href={`/admin/students/${alert.id}/attendance`}
                      className="text-xs text-red-700 hover:text-red-800 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {attendanceAlerts.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-medium">All Clear!</p>
                <p className="text-sm text-neutral-600">No attendance issues found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Attendance Activity */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Attendance Activity</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search students, sessions..."
                  className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Session</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecentAttendance.slice(0, 20).map((record) => (
                  <tr key={record.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {record.student.firstName} {record.student.lastName}
                        </p>
                        <p className="text-xs text-neutral-600">{record.student.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-neutral-900">{record.session.title}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-neutral-900">{record.session.subject.name}</p>
                      <p className="text-xs text-neutral-600">{record.session.subject.class.name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-neutral-900">
                        {new Date(record.session.startTime).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {new Date(record.session.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${attendanceService.getStatusColor(record.status)}`}>
                        {attendanceService.formatStatus(record.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-neutral-400 hover:text-neutral-600">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRecentAttendance.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600">No attendance records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-8 w-8 text-green-600" />
            <h3 className="font-semibold text-green-900">Best Performing Class</h3>
          </div>
          <p className="text-2xl font-bold text-green-900 mb-1">Grade 10-A Mathematics</p>
          <p className="text-green-700">92% average attendance</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-8 w-8 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Monthly Target</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900 mb-1">85% Goal</p>
          <p className="text-blue-700">Currently at 87%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Most Active Subject</h3>
          </div>
          <p className="text-2xl font-bold text-purple-900 mb-1">Mathematics</p>
          <p className="text-purple-700">128 sessions this month</p>
        </div>
      </div>
    </div>
  );
}