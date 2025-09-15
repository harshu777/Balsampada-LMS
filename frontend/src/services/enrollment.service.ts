import api from './api';

export interface StudentEnrollment {
  id: string;
  studentId: string;
  subjectId: string;
  enrollmentDate: string;
  paymentStatus: PaymentStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
  };
  subject: {
    id: string;
    name: string;
    description?: string;
    class: {
      id: string;
      name: string;
      description?: string;
      grade?: string;
      academicYear?: string;
    };
    teachers?: TeacherSubject[];
    materials?: Material[];
    assignments?: Assignment[];
    tests?: Test[];
  };
  payments?: Payment[];
  _count?: {
    payments: number;
  };
}

export interface TeacherSubject {
  id: string;
  teacherId: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Material {
  id: string;
  title: string;
  description?: string;
  type: string;
  fileUrl?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  createdAt: string;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
  approvalDate?: string;
  dueDate?: string;
  receiptNumber?: string;
  description?: string;
  paidByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIAL';
export type PaymentType = 'ENROLLMENT_FEE' | 'MONTHLY_FEE' | 'EXAM_FEE' | 'MATERIAL_FEE' | 'OTHER';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE' | 'OTHER';

export interface CreateEnrollmentDto {
  studentId: string;
  subjectId: string;
  enrollmentDate?: string;
  paymentStatus?: PaymentStatus;
  isActive?: boolean;
}

export interface UpdateEnrollmentStatusDto {
  isActive: boolean;
  paymentStatus?: PaymentStatus;
}

export interface BulkUpdateEnrollmentDto {
  enrollmentIds: string[];
  isActive: boolean;
  paymentStatus?: PaymentStatus;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  inactiveEnrollments: number;
  paymentStats: {
    pending: number;
    approved: number;
    rejected: number;
  };
  enrollmentTrend: Array<{
    enrollmentDate: string;
    _count: { id: number };
  }>;
}

export interface PaginatedResponse<T> {
  enrollments?: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class EnrollmentService {
  private static instance: EnrollmentService;

  private constructor() {}

  static getInstance(): EnrollmentService {
    if (!EnrollmentService.instance) {
      EnrollmentService.instance = new EnrollmentService();
    }
    return EnrollmentService.instance;
  }

  async createEnrollment(data: CreateEnrollmentDto): Promise<StudentEnrollment> {
    const response = await api.post('/enrollments', data);
    return response.data;
  }

  async getEnrollments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
    studentId?: string;
    isActive?: boolean;
    paymentStatus?: PaymentStatus;
  }): Promise<PaginatedResponse<StudentEnrollment>> {
    const response = await api.get('/enrollments', { params });
    return response.data;
  }

  async getEnrollment(id: string): Promise<StudentEnrollment> {
    const response = await api.get(`/enrollments/${id}`);
    return response.data;
  }

  async updateEnrollmentStatus(id: string, data: UpdateEnrollmentStatusDto): Promise<StudentEnrollment> {
    const response = await api.patch(`/enrollments/${id}/status`, data);
    return response.data;
  }

  async bulkUpdateEnrollments(data: BulkUpdateEnrollmentDto): Promise<{ message: string; updatedCount: number }> {
    const response = await api.patch('/enrollments/bulk-update', data);
    return response.data;
  }

  async deleteEnrollment(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/enrollments/${id}`);
    return response.data;
  }

  async getMyEnrollments(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<PaginatedResponse<StudentEnrollment>> {
    const response = await api.get('/enrollments/my-enrollments', { params });
    return response.data;
  }

  async getEnrollmentsBySubject(subjectId: string, params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<PaginatedResponse<StudentEnrollment>> {
    const response = await api.get(`/enrollments/subject/${subjectId}`, { params });
    return response.data;
  }

  async getEnrollmentsByStudent(studentId: string, params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<PaginatedResponse<StudentEnrollment>> {
    const response = await api.get(`/enrollments/student/${studentId}`, { params });
    return response.data;
  }

  async getEnrollmentStats(): Promise<EnrollmentStats> {
    const response = await api.get('/enrollments/stats');
    return response.data;
  }

  // Helper methods for UI
  formatStudentName(enrollment: StudentEnrollment): string {
    return `${enrollment.student.firstName} ${enrollment.student.lastName}`;
  }

  formatSubjectName(enrollment: StudentEnrollment): string {
    return `${enrollment.subject.name} (${enrollment.subject.class.name})`;
  }

  getEnrollmentStatus(enrollment: StudentEnrollment): 'active' | 'inactive' {
    return enrollment.isActive ? 'active' : 'inactive';
  }

  getEnrollmentStatusColor(enrollment: StudentEnrollment): string {
    return enrollment.isActive ? 'text-green-600' : 'text-gray-400';
  }

  getPaymentStatusColor(status: PaymentStatus): string {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'REJECTED':
        return 'text-red-600 bg-red-100';
      case 'PARTIAL':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  formatPaymentStatus(status: PaymentStatus): string {
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  formatEnrollmentDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  hasActivePayment(enrollment: StudentEnrollment): boolean {
    return enrollment.payments?.some(payment => payment.status === 'APPROVED') || false;
  }

  getLatestPayment(enrollment: StudentEnrollment): Payment | null {
    if (!enrollment.payments || enrollment.payments.length === 0) {
      return null;
    }
    return enrollment.payments[0]; // Payments are ordered by createdAt desc
  }

  getTotalPaidAmount(enrollment: StudentEnrollment): number {
    if (!enrollment.payments) return 0;
    return enrollment.payments
      .filter(payment => payment.status === 'APPROVED')
      .reduce((total, payment) => total + payment.amount, 0);
  }

  getPendingPaymentAmount(enrollment: StudentEnrollment): number {
    if (!enrollment.payments) return 0;
    return enrollment.payments
      .filter(payment => payment.status === 'PENDING')
      .reduce((total, payment) => total + payment.amount, 0);
  }

  isEnrollmentComplete(enrollment: StudentEnrollment): boolean {
    return enrollment.isActive && enrollment.paymentStatus === 'APPROVED';
  }

  canDeactivateEnrollment(enrollment: StudentEnrollment): boolean {
    return enrollment.isActive;
  }

  canActivateEnrollment(enrollment: StudentEnrollment): boolean {
    return !enrollment.isActive;
  }

  getSubjectTeachers(enrollment: StudentEnrollment): string {
    if (!enrollment.subject.teachers || enrollment.subject.teachers.length === 0) {
      return 'No teachers assigned';
    }
    return enrollment.subject.teachers
      .map(ts => `${ts.teacher.firstName} ${ts.teacher.lastName}`)
      .join(', ');
  }

  getEnrollmentDuration(enrollment: StudentEnrollment): string {
    const enrollmentDate = new Date(enrollment.enrollmentDate);
    const now = new Date();
    const diffInMonths = Math.floor((now.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffInMonths < 1) {
      return 'Less than a month';
    } else if (diffInMonths === 1) {
      return '1 month';
    } else {
      return `${diffInMonths} months`;
    }
  }

  sortEnrollmentsByDate(enrollments: StudentEnrollment[], order: 'asc' | 'desc' = 'desc'): StudentEnrollment[] {
    return [...enrollments].sort((a, b) => {
      const dateA = new Date(a.enrollmentDate).getTime();
      const dateB = new Date(b.enrollmentDate).getTime();
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  groupEnrollmentsByStatus(enrollments: StudentEnrollment[]): Record<string, StudentEnrollment[]> {
    return enrollments.reduce((groups, enrollment) => {
      const key = enrollment.isActive ? 'active' : 'inactive';
      if (!groups[key]) groups[key] = [];
      groups[key].push(enrollment);
      return groups;
    }, {} as Record<string, StudentEnrollment[]>);
  }

  groupEnrollmentsByPaymentStatus(enrollments: StudentEnrollment[]): Record<PaymentStatus, StudentEnrollment[]> {
    return enrollments.reduce((groups, enrollment) => {
      const status = enrollment.paymentStatus;
      if (!groups[status]) groups[status] = [];
      groups[status].push(enrollment);
      return groups;
    }, {} as Record<PaymentStatus, StudentEnrollment[]>);
  }
}

export default EnrollmentService.getInstance();