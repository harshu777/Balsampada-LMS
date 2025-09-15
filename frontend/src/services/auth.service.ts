import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    console.log('Login attempt with:', data.email);
    const response = await api.post<AuthResponse>('/auth/login', data);
    console.log('Login response:', response.data);
    
    if (response.data.accessToken) {
      console.log('Storing tokens in localStorage');
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken!);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Also set cookie for middleware to check authentication
      document.cookie = `user=${JSON.stringify(response.data.user)}; path=/; max-age=86400`; // 24 hours
      console.log('Tokens stored successfully');
    } else {
      console.warn('No accessToken in response!', response.data);
    }
    
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // Only store tokens if user is approved (Admin role)
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken!);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Also clear the cookie used by middleware
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    }
  }

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}

export default new AuthService();