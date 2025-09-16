import axios from 'axios';
import AuthService from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken: refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            AuthService.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Analytics endpoints
  async getDashboardStats() {
    const response = await this.api.get('/analytics/dashboard');
    return response.data;
  }

  // Document endpoints
  async uploadDocument(formData: FormData) {
    const response = await this.api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getDocuments(userId?: string) {
    const response = await this.api.get('/documents', {
      params: userId ? { userId } : {},
    });
    return response.data;
  }

  async approveDocument(id: string) {
    const response = await this.api.patch(`/documents/${id}/approve`);
    return response.data;
  }

  async rejectDocument(id: string, reason: string) {
    const response = await this.api.patch(`/documents/${id}/reject`, { reason });
    return response.data;
  }

  async clearNotifications() {
    const response = await this.api.delete('/notifications/clear');
    return response.data;
  }

  // Messaging endpoints
  async getConversations() {
    const response = await this.api.get('/messages/conversations');
    return response.data;
  }

  async getMessages(conversationId: string) {
    const response = await this.api.get(`/messages/conversation/${conversationId}`);
    return response.data;
  }

  async sendMessage(data: { content: string; receiverId: string; type: string }) {
    const response = await this.api.post('/messages', data);
    return response.data;
  }

  async markMessageAsRead(messageId: string) {
    const response = await this.api.patch(`/messages/${messageId}/read`);
    return response.data;
  }

  async getStudentPerformance(studentId: string, subjectId?: string) {
    const params = subjectId ? { subjectId } : {};
    const response = await this.api.get(`/analytics/student-performance/${studentId}`, { params });
    return response.data;
  }

  async getMyPerformance(subjectId?: string) {
    const params = subjectId ? { subjectId } : {};
    const response = await this.api.get('/analytics/my-performance', { params });
    return response.data;
  }

  async getClassPerformance(classId: string) {
    const response = await this.api.get(`/analytics/class-performance/${classId}`);
    return response.data;
  }

  async getRevenueAnalytics(startDate?: Date, endDate?: Date) {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    const response = await this.api.get('/analytics/revenue', { params });
    return response.data;
  }

  async getAttendanceAnalytics(subjectId?: string, startDate?: Date, endDate?: Date) {
    const params: any = {};
    if (subjectId) params.subjectId = subjectId;
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    const response = await this.api.get('/analytics/attendance', { params });
    return response.data;
  }

  async getTeacherAnalytics() {
    const response = await this.api.get('/analytics/teacher');
    return response.data;
  }

  // User endpoints
  async getUsers(role?: string) {
    const params = role ? { role } : {};
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.api.patch(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  async updateUserStatus(id: string, status: string) {
    const response = await this.api.patch(`/users/${id}/status`, { status });
    return response.data;
  }

  // Class endpoints
  async getClasses() {
    const response = await this.api.get('/classes');
    return response.data;
  }

  async getClassById(id: string) {
    const response = await this.api.get(`/classes/${id}`);
    return response.data;
  }

  async createClass(data: any) {
    const response = await this.api.post('/classes', data);
    return response.data;
  }

  async updateClass(id: string, data: any) {
    const response = await this.api.patch(`/classes/${id}`, data);
    return response.data;
  }

  async deleteClass(id: string) {
    const response = await this.api.delete(`/classes/${id}`);
    return response.data;
  }

  // Subject endpoints
  async getSubjects() {
    const response = await this.api.get('/subjects');
    return response.data;
  }

  async getSubjectById(id: string) {
    const response = await this.api.get(`/subjects/${id}`);
    return response.data;
  }

  async createSubject(data: any) {
    const response = await this.api.post('/subjects', data);
    return response.data;
  }

  async updateSubject(id: string, data: any) {
    const response = await this.api.patch(`/subjects/${id}`, data);
    return response.data;
  }

  async deleteSubject(id: string) {
    const response = await this.api.delete(`/subjects/${id}`);
    return response.data;
  }

  // Payment endpoints
  async getPayments() {
    const response = await this.api.get('/payments');
    return response.data;
  }

  async getPaymentById(id: string) {
    const response = await this.api.get(`/payments/${id}`);
    return response.data;
  }

  async createPayment(data: any) {
    const response = await this.api.post('/payments', data);
    return response.data;
  }

  async updatePaymentStatus(id: string, status: string) {
    const response = await this.api.patch(`/payments/${id}/status`, { status });
    return response.data;
  }

  // Enrollment endpoints
  async getEnrollments() {
    const response = await this.api.get('/enrollments');
    return response.data;
  }

  async getMyEnrollments() {
    const response = await this.api.get('/enrollments/my-enrollments');
    return response.data;
  }

  async enrollInSubject(subjectId: string) {
    const response = await this.api.post('/enrollments', { subjectId });
    return response.data;
  }

  async unenrollFromSubject(enrollmentId: string) {
    const response = await this.api.delete(`/enrollments/${enrollmentId}`);
    return response.data;
  }

  // Assignment endpoints
  async getAssignments() {
    const response = await this.api.get('/assignments');
    return response.data;
  }

  async getAssignmentById(id: string) {
    const response = await this.api.get(`/assignments/${id}`);
    return response.data;
  }

  async createAssignment(data: any) {
    const response = await this.api.post('/assignments', data);
    return response.data;
  }

  async updateAssignment(id: string, data: any) {
    const response = await this.api.patch(`/assignments/${id}`, data);
    return response.data;
  }

  async deleteAssignment(id: string) {
    const response = await this.api.delete(`/assignments/${id}`);
    return response.data;
  }

  async submitAssignment(assignmentId: string, data: any) {
    const response = await this.api.post(`/assignments/${assignmentId}/submit`, data);
    return response.data;
  }

  async gradeAssignment(submissionId: string, grade: number, feedback: string) {
    const response = await this.api.patch(`/assignments/submissions/${submissionId}/grade`, {
      grade,
      feedback,
    });
    return response.data;
  }

  // Test endpoints
  async getTests() {
    const response = await this.api.get('/tests');
    return response.data;
  }

  async getTestById(id: string) {
    const response = await this.api.get(`/tests/${id}`);
    return response.data;
  }

  async createTest(data: any) {
    const response = await this.api.post('/tests', data);
    return response.data;
  }

  async updateTest(id: string, data: any) {
    const response = await this.api.patch(`/tests/${id}`, data);
    return response.data;
  }

  async deleteTest(id: string) {
    const response = await this.api.delete(`/tests/${id}`);
    return response.data;
  }

  async submitTest(testId: string, answers: any) {
    const response = await this.api.post(`/tests/${testId}/submit`, { answers });
    return response.data;
  }

  // Material endpoints
  async getMaterials() {
    const response = await this.api.get('/materials');
    return response.data;
  }

  async getMaterialById(id: string) {
    const response = await this.api.get(`/materials/${id}`);
    return response.data;
  }

  async uploadMaterial(formData: FormData) {
    const response = await this.api.post('/materials/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteMaterial(id: string) {
    const response = await this.api.delete(`/materials/${id}`);
    return response.data;
  }

  async downloadMaterial(id: string) {
    const response = await this.api.get(`/materials/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Attendance endpoints
  async getAttendance(subjectId?: string, date?: Date) {
    const params: any = {};
    if (subjectId) params.subjectId = subjectId;
    if (date) params.date = date.toISOString();
    const response = await this.api.get('/attendance', { params });
    return response.data;
  }

  async markAttendance(data: any) {
    const response = await this.api.post('/attendance', data);
    return response.data;
  }

  async updateAttendance(id: string, status: string) {
    const response = await this.api.patch(`/attendance/${id}`, { status });
    return response.data;
  }

  // Timetable endpoints
  async getTimetable() {
    const response = await this.api.get('/timetable');
    return response.data;
  }

  async getMyTimetable() {
    const response = await this.api.get('/timetable/my-timetable');
    return response.data;
  }

  async createTimetableEntry(data: any) {
    const response = await this.api.post('/timetable', data);
    return response.data;
  }

  async updateTimetableEntry(id: string, data: any) {
    const response = await this.api.patch(`/timetable/${id}`, data);
    return response.data;
  }

  async deleteTimetableEntry(id: string) {
    const response = await this.api.delete(`/timetable/${id}`);
    return response.data;
  }

  // Notification endpoints
  async getNotifications() {
    const response = await this.api.get('/notifications');
    return response.data;
  }

  async markNotificationAsRead(id: string) {
    const response = await this.api.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.api.patch('/notifications/read-all');
    return response.data;
  }

}

export default new ApiService();