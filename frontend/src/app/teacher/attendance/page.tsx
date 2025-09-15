'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  TrendingUp,
  TrendingDown,
  BarChart,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { attendanceService } from '@/services/attendance.service';

export default function TeacherAttendancePage() {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalStudents: 0,
    averageAttendance: 0,
    todaySessions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    fetchAttendanceData();
    fetchUpcomingSessions();
    fetchStats();
  }, [selectedPeriod, statusFilter, dateFilter]);

  const fetchAttendanceData = async () => {
    try {
      const query: any = {};
      if (statusFilter) query.status = statusFilter;
      if (dateFilter) query.startDate = dateFilter;
      
      const response = await attendanceService.getAttendance(query);
      if (response.status === 'success') {
        setAttendanceData(response.data.attendance);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const fetchUpcomingSessions = async () => {
    try {
      // This would be a sessions service call
      // For now using mock data
      setSessions([
        {
          id: '1',
          title: 'Mathematics Class',
          startTime: new Date().toISOString(),
          subject: { name: 'Mathematics', class: { name: 'Grade 10-A' } },
          attendanceMarked: false,
          totalStudents: 25
        },
        {
          id: '2',
          title: 'Physics Lab',
          startTime: new Date(Date.now() + 3600000).toISOString(),
          subject: { name: 'Physics', class: { name: 'Grade 11-B' } },
          attendanceMarked: true,
          totalStudents: 22
        }
      ]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const query: any = {};
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
        setStats({
          totalSessions: data.totalSessions,
          totalStudents: 0, // This would come from enrollment data
          averageAttendance: data.attendancePercentage,
          todaySessions: 0 // This would come from today's sessions
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAttendance = () => {
    if (attendanceData.length > 0) {
      attendanceService.exportToCSV(attendanceData, 'attendance-report');
    }
  };

  const filteredAttendance = attendanceData.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.session.title.toLowerCase().includes(searchTerm.toLowerCase());
    
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
          <h1 className="text-2xl font-bold text-neutral-900">Attendance Management</h1>
          <p className="text-neutral-600">Track and manage student attendance across all your classes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportAttendance}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link 
            href="/teacher/attendance/mark"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Mark Attendance
          </Link>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-neutral-700">Period:</span>
        {['today', 'week', 'month', 'all'].map((period) => (
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 text-blue-500" />
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.totalSessions}</p>
          <p className="text-sm text-neutral-600">Total Sessions</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-purple-500" />
            <span className="text-xs text-neutral-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.totalStudents}</p>
          <p className="text-sm text-neutral-600">Total Students</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <UserCheck className="h-8 w-8 text-green-500" />
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.averageAttendance}%</p>
          <p className="text-sm text-neutral-600">Average Attendance</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-orange-500" />
            <span className="text-xs text-neutral-600">Today</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.todaySessions}</p>
          <p className="text-sm text-neutral-600">Today's Sessions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Sessions</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="EXCUSED">Excused</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {filteredAttendance.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      record.status === 'PRESENT' ? 'bg-green-100' :
                      record.status === 'ABSENT' ? 'bg-red-100' :
                      record.status === 'LATE' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      {record.status === 'PRESENT' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : record.status === 'ABSENT' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : record.status === 'LATE' ? (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {record.student.firstName} {record.student.lastName}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {record.session.title} • {record.session.subject.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${attendanceService.getStatusColor(record.status)}`}>
                      {attendanceService.formatStatus(record.status)}
                    </span>
                    <button className="p-1 text-neutral-400 hover:text-neutral-600">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Upcoming Sessions</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-neutral-900">{session.title}</p>
                    {session.attendanceMarked ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-600">{session.subject.name}</p>
                  <p className="text-sm text-neutral-600">{session.subject.class.name}</p>
                  <p className="text-xs text-neutral-500 mt-2">
                    {new Date(session.startTime).toLocaleString()}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-neutral-600">
                      {session.totalStudents} students
                    </span>
                    {!session.attendanceMarked && (
                      <Link
                        href={`/teacher/attendance/mark?sessionId=${session.id}`}
                        className="text-xs text-primary hover:text-primary/80 font-medium"
                      >
                        Mark Attendance
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Insights */}
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Attendance Insights</h2>
            <Link href="/teacher/reports/attendance" className="text-sm text-primary hover:text-primary/80">
              View Detailed Reports
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">92%</p>
              <p className="text-sm text-neutral-600">Average Present Rate</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">5%</p>
              <p className="text-sm text-neutral-600">Average Absent Rate</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-900">3%</p>
              <p className="text-sm text-neutral-600">Average Late Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}