import api from './api';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  subjectId: string;
  teacherId: string;
  totalMarks?: number;
  dueDate: string;
  attachmentUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subject: {
    id: string;
    name: string;
    class: {
      id: string;
      name: string;
      grade?: string;
    };
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  submissions: StudentAssignment[];
  _count: {
    submissions: number;
  };
}

export interface StudentAssignment {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionUrl?: string;
  submissionText?: string;
  marksObtained?: number;
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
  assignment?: Assignment;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateAssignmentDto {
  title: string;
  description?: string;
  instructions?: string;
  subjectId: string;
  totalMarks?: number;
  dueDate: string;
  attachmentUrl?: string;
  isActive?: boolean;
}

export interface UpdateAssignmentDto extends Partial<CreateAssignmentDto> {}

export interface SubmitAssignmentDto {
  assignmentId: string;
  submissionText?: string;
  submissionUrl?: string;
}

export interface GradeAssignmentDto {
  studentAssignmentId: string;
  marksObtained?: number;
  feedback?: string;
}

export interface AssignmentStats {
  totalStudents: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  gradedSubmissions: number;
  pendingGrading: number;
  submissionRate: number;
  gradingRate: number;
  averageMarks: number;
  maxMarks: number;
  minMarks: number;
  totalMarks?: number;
}

export interface PaginatedAssignments {
  assignments: Assignment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedStudentAssignments {
  assignments: StudentAssignment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class AssignmentService {
  private baseUrl = '/assignments';

  // Teacher/Admin methods
  async createAssignment(data: CreateAssignmentDto, attachment?: File): Promise<Assignment> {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = data[key as keyof CreateAssignmentDto];
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await api.post(this.baseUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getAssignments(params?: {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
    teacherId?: string;
    isActive?: boolean;
  }): Promise<PaginatedAssignments> {
    const response = await api.get(this.baseUrl, { params });
    return response.data;
  }

  async getAssignment(id: string, includeAnswers?: boolean): Promise<Assignment> {
    const params = includeAnswers ? { includeAnswers: 'true' } : undefined;
    const response = await api.get(`${this.baseUrl}/${id}`, { params });
    return response.data;
  }

  async updateAssignment(id: string, data: UpdateAssignmentDto, attachment?: File): Promise<Assignment> {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = data[key as keyof UpdateAssignmentDto];
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await api.patch(`${this.baseUrl}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteAssignment(id: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getAssignmentStats(id: string): Promise<AssignmentStats> {
    const response = await api.get(`${this.baseUrl}/${id}/stats`);
    return response.data;
  }

  async gradeAssignment(data: GradeAssignmentDto): Promise<StudentAssignment> {
    const response = await api.post(`${this.baseUrl}/grade`, data);
    return response.data;
  }

  // Student methods
  async getMyAssignments(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'submitted' | 'graded';
  }): Promise<PaginatedStudentAssignments> {
    const response = await api.get(`${this.baseUrl}/my-assignments`, { params });
    return response.data;
  }

  async submitAssignment(data: SubmitAssignmentDto, submission?: File): Promise<StudentAssignment> {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = data[key as keyof SubmitAssignmentDto];
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    if (submission) {
      formData.append('submission', submission);
    }

    const response = await api.post(`${this.baseUrl}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Utility methods
  async downloadAttachment(url: string, filename?: string): Promise<void> {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'assignment-attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  getStatusColor(status: 'pending' | 'submitted' | 'graded'): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDueDate(dueDate: string): string {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export default new AssignmentService();