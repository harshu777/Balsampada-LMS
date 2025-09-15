'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  TrendingUp,
  TrendingDown,
  BookOpen,
  BarChart3,
  Filter,
  Search,
  Download,
  Info
} from 'lucide-react';
import { attendanceService } from '@/services/attendance.service';

export default function StudentAttendancePage() {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendanceReport, setAttendanceReport] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalSessions: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendancePercentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttendanceData();
    fetchAttendanceReport();
  }, [selectedSubject, selectedPeriod]);

  const fetchAttendanceData = async () => {
    try {
      const query: any = {};
      if (selectedSubject) query.subjectId = selectedSubject;
      
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

      const response = await attendanceService.getMyAttendance(query);
      if (response.status === 'success') {
        setAttendanceData(response.data.attendance);
      }

      // Get overall stats
      const statsResponse = await attendanceService.getAttendanceStats(query);
      if (statsResponse.status === 'success') {
        setOverallStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const fetchAttendanceReport = async () => {
    try {
      // This would normally get the current user's ID from auth context
      const userId = 'current-user-id';
      const response = await attendanceService.getStudentAttendanceReport(
        userId,
        selectedSubject || undefined
      );
      if (response.status === 'success') {
        setAttendanceReport(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendance report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAttendance = () => {
    if (attendanceData.length > 0) {
      attendanceService.exportToCSV(attendanceData, 'my-attendance-report');
    }
  };

  const getSubjects = () => {
    const subjects = attendanceReport.map(report => report.subject);
    return [...new Map(subjects.map(s => [s.id, s])).values()];
  };

  const filteredAttendance = attendanceData.filter(record => {
    const matchesSearch = searchTerm === '' || 
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
          <h1 className="text-2xl font-bold text-neutral-900">My Attendance</h1>
          <p className="text-neutral-600">Track your attendance across all subjects</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportAttendance}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700">Period:</span>
          {['week', 'month', 'semester', 'all'].map((period) => (
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
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">All Subjects</option>
          {getSubjects().map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 text-blue-500" />
            <span className="text-xs text-neutral-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{overallStats.totalSessions}</p>
          <p className="text-sm text-neutral-600">Sessions</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <span className="text-xs text-green-600">{overallStats.present}</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{overallStats.present}</p>
          <p className="text-sm text-neutral-600">Present</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
            <span className="text-xs text-red-600">{overallStats.absent}</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{overallStats.absent}</p>
          <p className="text-sm text-neutral-600">Absent</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-yellow-500" />
            <span className="text-xs text-yellow-600">{overallStats.late}</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{overallStats.late}</p>
          <p className="text-sm text-neutral-600">Late</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <UserCheck className="h-8 w-8 text-primary" />
            {overallStats.attendancePercentage >= 75 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className={`text-2xl font-bold ${
            overallStats.attendancePercentage >= 75 ? 'text-green-600' : 
            overallStats.attendancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {overallStats.attendancePercentage}%
          </p>
          <p className="text-sm text-neutral-600">Attendance Rate</p>
        </div>
      </div>

      {/* Attendance Alert */}
      {overallStats.attendancePercentage < 75 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Low Attendance Alert</p>
              <p className="text-sm text-red-700 mt-1">
                Your attendance is below 75%. Please attend classes regularly to maintain good academic standing.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-wise Attendance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Subject-wise Attendance</h2>
              <BarChart3 className="h-5 w-5 text-neutral-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {attendanceReport.map((report) => (
                <div key={report.subject.id} className="p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-neutral-900">{report.subject.name}</p>
                      <p className="text-sm text-neutral-600">{report.subject.class.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        report.attendancePercentage >= 75 ? 'text-green-600' : 
                        report.attendancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {report.attendancePercentage}%
                      </p>
                      <p className="text-sm text-neutral-600">
                        {report.present + report.late}/{report.totalSessions}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1 bg-neutral-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          report.attendancePercentage >= 75 ? 'bg-green-500' :
                          report.attendancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${report.attendancePercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <p className="font-medium text-green-600">{report.present}</p>
                      <p className="text-neutral-600">Present</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-red-600">{report.absent}</p>
                      <p className="text-neutral-600">Absent</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-yellow-600">{report.late}</p>
                      <p className="text-neutral-600">Late</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-blue-600">{report.excused}</p>
                      <p className="text-neutral-600">Excused</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Sessions</h2>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-8 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredAttendance.slice(0, 20).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-neutral-900">
                      {record.session.title}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {record.session.subject.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(record.session.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      record.status === 'PRESENT' ? 'bg-green-500' :
                      record.status === 'ABSENT' ? 'bg-red-500' :
                      record.status === 'LATE' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <span className={`text-xs font-medium ${attendanceService.getStatusColor(record.status)}`}>
                      {attendanceService.formatStatus(record.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredAttendance.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-600">No attendance records found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Info className="h-6 w-6 text-blue-500 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Attendance Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">Maintain 75%+ Attendance</p>
                <p>Keep your attendance above 75% to be eligible for exams and assessments.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Join Classes on Time</p>
                <p>Arrive early to avoid being marked late and to not miss important announcements.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Notify for Absences</p>
                <p>Inform your teacher in advance if you can't attend a class for valid reasons.</p>
              </div>
              <div>
                <p className="font-medium mb-1">Track Your Progress</p>
                <p>Regularly monitor your attendance to stay on track with your academic goals.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}