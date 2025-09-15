import api from './api';

export interface AttendanceStatus {
  PRESENT: 'PRESENT';
  ABSENT: 'ABSENT';
  LATE: 'LATE';
  EXCUSED: 'EXCUSED';
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Session {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  subject: {
    id: string;
    name: string;
    class: {
      id: string;
      name: string;
    };
  };
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  sessionId: string;
  status: keyof AttendanceStatus;
  notes?: string;
  markedBy?: string;
  createdAt: string;
  updatedAt: string;
  student: Student;
  session: Session;
}

export interface AttendanceStats {
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
}

export interface SessionAttendance {
  session: Session;
  attendance: Array<{
    student: Student;
    attendance: AttendanceRecord | null;
    status: keyof AttendanceStatus | null;
  }>;
  stats: {
    totalStudents: number;
    marked: number;
    unmarked: number;
  };
}

export interface MarkAttendanceData {
  sessionId: string;
  studentId: string;
  status: keyof AttendanceStatus;
  notes?: string;
}

export interface BulkAttendanceData {
  sessionId: string;
  attendanceData: Array<{
    studentId: string;
    status: keyof AttendanceStatus;
    notes?: string;
  }>;
}

export interface AttendanceQuery {
  studentId?: string;
  subjectId?: string;
  sessionId?: string;
  status?: keyof AttendanceStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AttendanceStatsQuery {
  studentId?: string;
  subjectId?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
  period?: 'weekly' | 'monthly' | 'yearly';
}

export interface SubjectAttendanceReport {
  subject: {
    id: string;
    name: string;
    class: {
      id: string;
      name: string;
    };
  };
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
  sessions: AttendanceRecord[];
}

export interface AttendanceAlert {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subjectId: string;
  subjectName: string;
  className: string;
  totalSessions: number;
  attendedSessions: number;
  attendancePercentage: number;
}

class AttendanceService {
  // Mark attendance for a single student
  async markAttendance(data: MarkAttendanceData) {
    const response = await api.post('/attendance/mark', data);
    return response.data;
  }

  // Mark attendance for multiple students
  async bulkMarkAttendance(data: BulkAttendanceData) {
    const response = await api.post('/attendance/bulk-mark', data);
    return response.data;
  }

  // Update existing attendance record
  async updateAttendance(attendanceId: string, data: Partial<MarkAttendanceData>) {
    const response = await api.put(`/attendance/${attendanceId}`, data);
    return response.data;
  }

  // Get attendance records with filters
  async getAttendance(query: AttendanceQuery = {}) {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`/attendance?${params.toString()}`);
    return response.data;
  }

  // Get attendance statistics
  async getAttendanceStats(query: AttendanceStatsQuery = {}) {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`/attendance/stats?${params.toString()}`);
    return response.data;
  }

  // Get student attendance report
  async getStudentAttendanceReport(studentId: string, subjectId?: string): Promise<{
    status: string;
    message: string;
    data: SubjectAttendanceReport[];
  }> {
    const params = subjectId ? `?subjectId=${subjectId}` : '';
    const response = await api.get(`/attendance/student/${studentId}/report${params}`);
    return response.data;
  }

  // Get attendance for a specific session
  async getSessionAttendance(sessionId: string): Promise<{
    status: string;
    message: string;
    data: SessionAttendance;
  }> {
    const response = await api.get(`/attendance/session/${sessionId}`);
    return response.data;
  }

  // Get attendance alerts (low attendance students)
  async getAttendanceAlerts(): Promise<{
    status: string;
    message: string;
    data: AttendanceAlert[];
  }> {
    const response = await api.get('/attendance/alerts');
    return response.data;
  }

  // Get current student's attendance (for students)
  async getMyAttendance(query: AttendanceQuery = {}) {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`/attendance/my-attendance?${params.toString()}`);
    return response.data;
  }

  // Delete attendance record (admin only)
  async deleteAttendance(attendanceId: string) {
    const response = await api.delete(`/attendance/${attendanceId}`);
    return response.data;
  }

  // Helper function to get attendance status color
  getStatusColor(status: keyof AttendanceStatus): string {
    switch (status) {
      case 'PRESENT':
        return 'text-green-600 bg-green-100';
      case 'ABSENT':
        return 'text-red-600 bg-red-100';
      case 'LATE':
        return 'text-yellow-600 bg-yellow-100';
      case 'EXCUSED':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Helper function to format attendance status
  formatStatus(status: keyof AttendanceStatus): string {
    switch (status) {
      case 'PRESENT':
        return 'Present';
      case 'ABSENT':
        return 'Absent';
      case 'LATE':
        return 'Late';
      case 'EXCUSED':
        return 'Excused';
      default:
        return 'Unknown';
    }
  }

  // Helper function to calculate attendance percentage
  calculateAttendancePercentage(stats: AttendanceStats): number {
    const { totalSessions, present, late } = stats;
    if (totalSessions === 0) return 0;
    return Math.round(((present + late) / totalSessions) * 100);
  }

  // Helper function to get attendance status options
  getStatusOptions() {
    return [
      { value: 'PRESENT', label: 'Present', color: 'green' },
      { value: 'ABSENT', label: 'Absent', color: 'red' },
      { value: 'LATE', label: 'Late', color: 'yellow' },
      { value: 'EXCUSED', label: 'Excused', color: 'blue' },
    ];
  }

  // Export attendance data to CSV
  exportToCSV(attendanceData: AttendanceRecord[], filename: string = 'attendance-report') {
    const headers = [
      'Date',
      'Session',
      'Student Name',
      'Email',
      'Subject',
      'Class',
      'Status',
      'Notes',
      'Marked By'
    ];

    const csvContent = [
      headers.join(','),
      ...attendanceData.map(record => [
        new Date(record.session.startTime).toLocaleDateString(),
        record.session.title,
        `${record.student.firstName} ${record.student.lastName}`,
        record.student.email,
        record.session.subject.name,
        record.session.subject.class.name,
        this.formatStatus(record.status),
        record.notes || '',
        record.markedBy || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;