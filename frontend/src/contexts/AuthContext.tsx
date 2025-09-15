'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService, { User, LoginData, RegisterData, AuthResponse } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            // Optionally refresh user data from server
            const profile = await authService.getProfile();
            setUser(profile);
          }
        }
      } catch (error: any) {
        // 401 is expected when not logged in, don't log as error
        if (error?.response?.status !== 401) {
          console.error('Auth initialization error:', error);
        }
        // Clear tokens silently
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData): Promise<AuthResponse> => {
    const response = await authService.login(data);
    setUser(response.user);
    
    // Redirect based on role
    if (response.user.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else if (response.user.role === 'TEACHER') {
      router.push('/teacher/dashboard');
    } else if (response.user.role === 'STUDENT') {
      router.push('/student/dashboard');
    }
    
    return response;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await authService.register(data);
    
    // Only set user if approved (Admin role gets immediate access)
    if (response.accessToken) {
      setUser(response.user);
      router.push('/admin/dashboard');
    }
    
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};