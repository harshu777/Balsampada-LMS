'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  BookOpen,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import authService from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting login form:', formData.email);
      const response = await authService.login(formData);
      console.log('Login successful, response:', response);
      
      // Redirect based on role
      if (response.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (response.user.role === 'TEACHER') {
        router.push('/teacher/dashboard');
      } else if (response.user.role === 'STUDENT') {
        router.push('/student/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setApiError('Invalid email or password');
      } else {
        setApiError('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear API error when user types
    if (apiError) {
      setApiError('');
    }
  };

  // Demo credentials for testing
  const demoCredentials = [
    { role: 'Admin', email: 'admin@tuitionlms.com', password: 'admin123' },
    { role: 'Teacher', email: 'teacher@tuitionlms.com', password: 'teacher123' },
    { role: 'Student', email: 'student@tuitionlms.com', password: 'student123' },
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    setFormData({ email, password });
    setErrors({});
    setApiError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Tuition LMS Logo" 
              className="h-12 w-auto"
            />
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome Back!</h1>
          <p className="text-neutral-600">Sign in to continue your learning journey</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {apiError && (
            <div className="mb-6 bg-danger/10 border border-danger text-danger rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.email ? 'border-danger' : 'border-neutral-300'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-danger">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.password ? 'border-danger' : 'border-neutral-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-danger">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-neutral-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-neutral-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Registration Links */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <p className="text-center text-neutral-600 mb-4">
              Don't have an account?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/register/student"
                className="flex items-center justify-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-lg hover:bg-secondary hover:text-white transition-colors font-medium text-sm"
              >
                <UserPlus className="h-4 w-4" />
                Student
              </Link>
              <Link
                href="/register/teacher"
                className="flex items-center justify-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-lg hover:bg-accent hover:text-white transition-colors font-medium text-sm"
              >
                <UserPlus className="h-4 w-4" />
                Teacher
              </Link>
            </div>
          </div>

          {/* Demo Credentials (for testing) */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 text-center mb-3">
              Demo Credentials (for testing)
            </p>
            <div className="space-y-2">
              {demoCredentials.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => fillDemoCredentials(demo.email, demo.password)}
                  className="w-full text-left text-xs bg-neutral-50 p-2 rounded hover:bg-neutral-100 transition-colors"
                >
                  <span className="font-medium">{demo.role}:</span>{' '}
                  <span className="text-neutral-600">{demo.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}