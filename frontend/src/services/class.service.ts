import api from './api';

export interface Class {
  id: string;
  name: string;
  description?: string;
  grade?: string;
  academicYear?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subjects?: Subject[];
  announcements?: Announcement[];
  _count?: {
    subjects: number;
  };
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  classId: string;
  isActive: boolean;
  teachers?: TeacherSubject[];
  enrollments?: StudentEnrollment[];
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
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export interface CreateClassDto {
  name: string;
  description?: string;
  grade?: string;
  academicYear?: string;
  isActive?: boolean;
}

export interface UpdateClassDto extends Partial<CreateClassDto> {}

export interface ClassStats {
  totalSubjects: number;
  totalStudents: number;
  totalTeachers: number;
  totalAssignments: number;
  totalTests: number;
}

export interface PaginatedResponse<T> {
  classes?: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ClassService {
  private static instance: ClassService;

  private constructor() {}

  static getInstance(): ClassService {
    if (!ClassService.instance) {
      ClassService.instance = new ClassService();
    }
    return ClassService.instance;
  }

  async createClass(data: CreateClassDto): Promise<Class> {
    const response = await api.post('/classes', data);
    return response.data;
  }

  async getClasses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Class>> {
    const response = await api.get('/classes', { params });
    return response.data;
  }

  async getClass(id: string): Promise<Class> {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  }

  async updateClass(id: string, data: UpdateClassDto): Promise<Class> {
    const response = await api.patch(`/classes/${id}`, data);
    return response.data;
  }

  async deleteClass(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  }

  async getClassStats(id: string): Promise<ClassStats> {
    const response = await api.get(`/classes/${id}/stats`);
    return response.data;
  }

  // Helper methods for UI
  async getAllActiveClasses(): Promise<Class[]> {
    const response = await this.getClasses({ isActive: true, limit: 1000 });
    return response.classes || [];
  }

  async searchClasses(query: string): Promise<Class[]> {
    const response = await this.getClasses({ search: query, limit: 50 });
    return response.classes || [];
  }

  formatClassName(classData: Class): string {
    const parts = [classData.name];
    if (classData.grade) parts.push(`Grade ${classData.grade}`);
    if (classData.academicYear) parts.push(classData.academicYear);
    return parts.join(' - ');
  }

  getClassStatus(classData: Class): 'active' | 'inactive' {
    return classData.isActive ? 'active' : 'inactive';
  }

  getClassStatusColor(classData: Class): string {
    return classData.isActive ? 'text-green-600' : 'text-gray-400';
  }

  getTotalStudents(classData: Class): number {
    if (!classData.subjects) return 0;
    return classData.subjects.reduce((total, subject) => {
      return total + (subject.enrollments?.length || 0);
    }, 0);
  }

  getTotalTeachers(classData: Class): number {
    if (!classData.subjects) return 0;
    const teacherIds = new Set();
    classData.subjects.forEach(subject => {
      subject.teachers?.forEach(teacher => {
        teacherIds.add(teacher.teacherId);
      });
    });
    return teacherIds.size;
  }
}

export default ClassService.getInstance();