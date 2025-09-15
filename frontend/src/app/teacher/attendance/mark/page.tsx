'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  Save,
  ArrowLeft,
  Search,
  Filter,
  User,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { attendanceService } from '@/services/attendance.service';

export default function MarkAttendancePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get('sessionId');

  const [sessionData, setSessionData] = useState<any>(null);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectAll, setSelectAll] = useState('');

  useEffect(() => {
    if (sessionId) {
      fetchSessionAttendance();
    }
  }, [sessionId]);

  const fetchSessionAttendance = async () => {
    try {
      const response = await attendanceService.getSessionAttendance(sessionId!);
      if (response.status === 'success') {
        setSessionData(response.data);
        setAttendanceList(response.data.attendance.map((item: any) => ({
          ...item,
          status: item.attendance?.status || 'PRESENT' // Default to present
        })));
      }
    } catch (error) {
      console.error('Error fetching session attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceList(prev => prev.map(item => 
      item.student.id === studentId ? { ...item, status } : item
    ));
  };

  const handleSelectAll = (status: string) => {
    setSelectAll(status);
    setAttendanceList(prev => prev.map(item => ({ ...item, status })));
  };

  const handleSaveAttendance = async () => {
    if (!sessionId) return;
    
    setIsSaving(true);
    try {
      const attendanceData = attendanceList.map(item => ({
        studentId: item.student.id,
        status: item.status,
        notes: item.notes || ''
      }));

      await attendanceService.bulkMarkAttendance({
        sessionId,
        attendanceData
      });

      router.push('/teacher/attendance');
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAttendance = attendanceList.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    return attendanceList.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Session Not Found</h2>
          <p className="text-neutral-600 mb-4">The session you're looking for doesn't exist.</p>
          <Link href="/teacher/attendance" className="text-primary hover:text-primary/80">
            Back to Attendance
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/teacher/attendance"
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Mark Attendance</h1>
            <p className="text-neutral-600">{sessionData.session.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/teacher/attendance')}
            className="px-4 py-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-neutral-500">Date</p>
              <p className="font-medium">
                {new Date(sessionData.session.startTime).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-neutral-500">Time</p>
              <p className="font-medium">
                {new Date(sessionData.session.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-neutral-500">Subject</p>
              <p className="font-medium">{sessionData.session.subject.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-neutral-500">Class</p>
              <p className="font-medium">{sessionData.session.subject.class.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-neutral-700">Present</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{statusCounts.PRESENT || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-neutral-700">Absent</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{statusCounts.ABSENT || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-neutral-700">Late</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.LATE || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-neutral-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-neutral-700">Excused</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{statusCounts.EXCUSED || 0}</p>
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-lg p-4 border border-neutral-200">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Quick Mark All</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSelectAll('PRESENT')}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              All Present
            </button>
            <button
              onClick={() => handleSelectAll('ABSENT')}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Students ({attendanceList.length})
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search students..."
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

        {/* Student List */}
        <div className="space-y-3">
          {filteredAttendance.map((item) => (
            <div key={item.student.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {item.student.firstName} {item.student.lastName}
                  </p>
                  <p className="text-sm text-neutral-600 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {item.student.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {attendanceService.getStatusOptions().map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(item.student.id, option.value)}
                      className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        item.status === option.value
                          ? `bg-${option.color}-100 border-${option.color}-500 text-${option.color}-700`
                          : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {/* Status indicator */}
                <div className={`w-3 h-3 rounded-full ${
                  item.status === 'PRESENT' ? 'bg-green-500' :
                  item.status === 'ABSENT' ? 'bg-red-500' :
                  item.status === 'LATE' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
              </div>
            </div>
          ))}
        </div>

        {filteredAttendance.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600">No students found</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Attendance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-700 font-medium">Present</span>
            <span className="text-green-900 font-bold">{statusCounts.PRESENT || 0}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <span className="text-red-700 font-medium">Absent</span>
            <span className="text-red-900 font-bold">{statusCounts.ABSENT || 0}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <span className="text-yellow-700 font-medium">Late</span>
            <span className="text-yellow-900 font-bold">{statusCounts.LATE || 0}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-700 font-medium">Excused</span>
            <span className="text-blue-900 font-bold">{statusCounts.EXCUSED || 0}</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-neutral-100 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-neutral-900">Attendance Rate</span>
            <span className="font-bold text-neutral-900">
              {Math.round(((statusCounts.PRESENT || 0) + (statusCounts.LATE || 0)) / attendanceList.length * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}