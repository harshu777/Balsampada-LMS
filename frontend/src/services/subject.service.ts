import api from './api';

export interface Subject {
  id: string;
  name: string;
  description?: string;
  classId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  class?: Class;
  teachers?: TeacherSubject[];
  enrollments?: StudentEnrollment[];
  materials?: Material[];
  assignments?: Assignment[];
  tests?: Test[];
  _count?: {
    teachers: number;
    enrollments: number;
    materials: number;
    assignments: number;
    tests: number;
  };
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  grade?: string;
  academicYear?: string;
}

export interface TeacherSubject {
  id: string;
  teacherId: string;
  subjectId: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  subject?: Subject;
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  subjectId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Material {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  type: string;
  fileUrl?: string;
  content?: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt: string;
}

export interface Assignment {
  id: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description?: string;
  dueDate: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Test {
  id: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateSubjectDto {
  name: string;
  description?: string;
  classId: string;
  isActive?: boolean;
}

export interface UpdateSubjectDto extends Partial<CreateSubjectDto> {}

export interface SubjectStats {
  totalTeachers: number;
  totalStudents: number;
  totalMaterials: number;
  totalAssignments: number;
  totalTests: number;
}

export interface PaginatedResponse<T> {
  subjects?: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class SubjectService {
  private static instance: SubjectService;

  private constructor() {}

  static getInstance(): SubjectService {
    if (!SubjectService.instance) {
      SubjectService.instance = new SubjectService();
    }
    return SubjectService.instance;
  }

  async createSubject(data: CreateSubjectDto): Promise<Subject> {
    const response = await api.post('/subjects', data);
    return response.data;
  }

  async getSubjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
    classId?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Subject>> {
    const response = await api.get('/subjects', { params });
    return response.data;
  }

  async getSubject(id: string): Promise<Subject> {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  }

  async updateSubject(id: string, data: UpdateSubjectDto): Promise<Subject> {
    const response = await api.patch(`/subjects/${id}`, data);
    return response.data;
  }

  async deleteSubject(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  }

  async getSubjectStats(id: string): Promise<SubjectStats> {
    const response = await api.get(`/subjects/${id}/stats`);
    return response.data;
  }

  async assignTeacher(subjectId: string, teacherId: string): Promise<TeacherSubject> {
    const response = await api.post(`/subjects/${subjectId}/assign-teacher/${teacherId}`);
    return response.data;
  }

  async unassignTeacher(subjectId: string, teacherId: string): Promise<{ message: string }> {
    const response = await api.delete(`/subjects/${subjectId}/unassign-teacher/${teacherId}`);
    return response.data;
  }

  async getMySubjects(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Subject>> {
    const response = await api.get('/subjects/my-subjects', { params });
    return response.data;
  }

  // Helper methods for UI
  async getAllActiveSubjects(): Promise<Subject[]> {
    const response = await this.getSubjects({ isActive: true, limit: 1000 });
    return response.subjects || [];
  }

  async getSubjectsByClass(classId: string): Promise<Subject[]> {
    const response = await this.getSubjects({ classId, isActive: true, limit: 1000 });
    return response.subjects || [];
  }

  async searchSubjects(query: string): Promise<Subject[]> {
    const response = await this.getSubjects({ search: query, limit: 50 });
    return response.subjects || [];
  }

  formatSubjectName(subject: Subject): string {
    const parts = [subject.name];
    if (subject.class) {
      parts.push(`(${subject.class.name})`);
    }
    return parts.join(' ');
  }

  getSubjectStatus(subject: Subject): 'active' | 'inactive' {
    return subject.isActive ? 'active' : 'inactive';
  }

  getSubjectStatusColor(subject: Subject): string {
    return subject.isActive ? 'text-green-600' : 'text-gray-400';
  }

  getTeacherNames(subject: Subject): string {
    if (!subject.teachers || subject.teachers.length === 0) {
      return 'No teachers assigned';
    }
    return subject.teachers
      .map(ts => `${ts.teacher.firstName} ${ts.teacher.lastName}`)
      .join(', ');
  }

  getEnrollmentCount(subject: Subject): number {
    return subject.enrollments?.length || 0;
  }

  hasTeacher(subject: Subject, teacherId: string): boolean {
    return subject.teachers?.some(ts => ts.teacherId === teacherId) || false;
  }

  canAssignTeacher(subject: Subject, teacherId: string): boolean {
    return !this.hasTeacher(subject, teacherId);
  }

  formatClassName(subject: Subject): string {
    if (!subject.class) return '';
    const parts = [subject.class.name];
    if (subject.class.grade) parts.push(`Grade ${subject.class.grade}`);
    if (subject.class.academicYear) parts.push(subject.class.academicYear);
    return parts.join(' - ');
  }

  getActivitySummary(subject: Subject): string {
    const parts = [];
    if (subject._count) {
      if (subject._count.materials > 0) {
        parts.push(`${subject._count.materials} materials`);
      }
      if (subject._count.assignments > 0) {
        parts.push(`${subject._count.assignments} assignments`);
      }
      if (subject._count.tests > 0) {
        parts.push(`${subject._count.tests} tests`);
      }
    }
    return parts.length > 0 ? parts.join(', ') : 'No activities';
  }
}

export default SubjectService.getInstance();