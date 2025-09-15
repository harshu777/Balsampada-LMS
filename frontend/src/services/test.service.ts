import api from './api';

export enum QuestionType {
  MCQ = 'MCQ',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANK = 'FILL_BLANK',
}

export interface QuestionOption {
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  marks: number;
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  isRequired?: boolean;
}

export interface Test {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  teacherId: string;
  questions: Question[];
  totalMarks: number;
  duration: number; // in minutes
  startTime: string;
  endTime: string;
  isActive: boolean;
  allowMultipleAttempts?: boolean;
  showResultsImmediately?: boolean;
  shuffleQuestions?: boolean;
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
  attempts: StudentTest[];
  _count: {
    attempts: number;
  };
}

export interface StudentTest {
  id: string;
  testId: string;
  studentId: string;
  answers: Answer[];
  marksObtained?: number;
  feedback?: string;
  startedAt: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  test?: Test;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Answer {
  questionId: string;
  answer?: string;
  selectedOptions?: string[];
}

export interface CreateTestDto {
  title: string;
  description?: string;
  subjectId: string;
  questions: Omit<Question, 'id'>[];
  totalMarks: number;
  duration: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
  allowMultipleAttempts?: boolean;
  showResultsImmediately?: boolean;
  shuffleQuestions?: boolean;
}

export interface UpdateTestDto extends Partial<CreateTestDto> {}

export interface SubmitTestDto {
  testId: string;
  answers: Answer[];
}

export interface StartTestDto {
  testId: string;
}

export interface TestStats {
  totalStudents: number;
  totalAttempts: number;
  notAttempted: number;
  attemptRate: number;
  averageMarks: number;
  maxMarks: number;
  minMarks: number;
  totalMarks: number;
  passedStudents: number;
  failedStudents: number;
  passRate: number;
  averageTime: number;
}

export interface PaginatedTests {
  tests: Test[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedStudentTests {
  tests: (Test & { attempts: StudentTest[] })[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class TestService {
  private baseUrl = '/tests';

  // Teacher/Admin methods
  async createTest(data: CreateTestDto): Promise<Test> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async getTests(params?: {
    page?: number;
    limit?: number;
    search?: string;
    subjectId?: string;
    teacherId?: string;
    isActive?: boolean;
  }): Promise<PaginatedTests> {
    const response = await api.get(this.baseUrl, { params });
    return response.data;
  }

  async getTest(id: string, includeAnswers?: boolean): Promise<Test> {
    const params = includeAnswers ? { includeAnswers: 'true' } : undefined;
    const response = await api.get(`${this.baseUrl}/${id}`, { params });
    return response.data;
  }

  async updateTest(id: string, data: UpdateTestDto): Promise<Test> {
    const response = await api.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteTest(id: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getTestStats(id: string): Promise<TestStats> {
    const response = await api.get(`${this.baseUrl}/${id}/stats`);
    return response.data;
  }

  // Student methods
  async getMyTests(params?: {
    page?: number;
    limit?: number;
    status?: 'upcoming' | 'ongoing' | 'completed';
  }): Promise<PaginatedStudentTests> {
    const response = await api.get(`${this.baseUrl}/my-tests`, { params });
    return response.data;
  }

  async startTest(data: StartTestDto): Promise<StudentTest> {
    const response = await api.post(`${this.baseUrl}/start`, data);
    return response.data;
  }

  async submitTest(data: SubmitTestDto): Promise<StudentTest> {
    const response = await api.post(`${this.baseUrl}/submit`, data);
    return response.data;
  }

  async getTestResults(id: string): Promise<StudentTest> {
    const response = await api.get(`${this.baseUrl}/${id}/results`);
    return response.data;
  }

  // Utility methods
  getTestStatus(test: Test): 'upcoming' | 'ongoing' | 'completed' {
    const now = new Date();
    const startTime = new Date(test.startTime);
    const endTime = new Date(test.endTime);

    if (now < startTime) {
      return 'upcoming';
    } else if (now >= startTime && now <= endTime) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  }

  getStatusColor(status: 'upcoming' | 'ongoing' | 'completed'): string {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getAttemptStatus(test: Test & { attempts: StudentTest[] }): 'not_started' | 'in_progress' | 'submitted' {
    const attempt = test.attempts?.[0];
    
    if (!attempt) {
      return 'not_started';
    }
    
    return attempt.submittedAt ? 'submitted' : 'in_progress';
  }

  formatTimeRemaining(endTime: string, duration: number, startedAt?: string): string {
    const now = new Date();
    const testEndTime = new Date(endTime);
    
    let effectiveEndTime = testEndTime;
    
    if (startedAt) {
      const attemptEndTime = new Date(new Date(startedAt).getTime() + duration * 60000);
      effectiveEndTime = attemptEndTime < testEndTime ? attemptEndTime : testEndTime;
    }

    const timeLeft = effectiveEndTime.getTime() - now.getTime();

    if (timeLeft <= 0) {
      return 'Time expired';
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  }

  calculateProgress(answers: Answer[], totalQuestions: number): number {
    const answeredQuestions = answers.filter(answer => 
      answer.answer || (answer.selectedOptions && answer.selectedOptions.length > 0)
    ).length;
    
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  }

  validateAnswer(question: Question, answer: Answer): boolean {
    switch (question.type) {
      case QuestionType.MCQ:
        return !!(answer.selectedOptions && answer.selectedOptions.length > 0);
      case QuestionType.TRUE_FALSE:
        return !!(answer.answer && (answer.answer === 'true' || answer.answer === 'false'));
      case QuestionType.SHORT_ANSWER:
      case QuestionType.ESSAY:
      case QuestionType.FILL_BLANK:
        return !!(answer.answer && answer.answer.trim().length > 0);
      default:
        return false;
    }
  }

  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  autoSave(testId: string, answers: Answer[]): void {
    const key = `test_${testId}_answers`;
    localStorage.setItem(key, JSON.stringify(answers));
  }

  loadSavedAnswers(testId: string): Answer[] {
    const key = `test_${testId}_answers`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  }

  clearSavedAnswers(testId: string): void {
    const key = `test_${testId}_answers`;
    localStorage.removeItem(key);
  }
}

export default new TestService();