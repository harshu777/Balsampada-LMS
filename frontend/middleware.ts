import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define protected routes
  const isProtectedRoute = 
    path.startsWith('/admin') || 
    path.startsWith('/teacher') || 
    path.startsWith('/student');
  
  // Check if user is authenticated by looking for the user data in cookies or localStorage
  // Note: In production, you should use httpOnly cookies for security
  const userCookie = request.cookies.get('user');
  
  if (isProtectedRoute && !userCookie) {
    // Redirect to login if trying to access protected route without authentication
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If logged in and trying to access login/register, redirect to appropriate dashboard
  if (userCookie && (path === '/login' || path.startsWith('/register'))) {
    try {
      const user = JSON.parse(userCookie.value);
      const dashboardPath = user.role === 'ADMIN' ? '/admin' : 
                           user.role === 'TEACHER' ? '/teacher' : 
                           '/student';
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    } catch (e) {
      // If cookie is invalid, continue to login page
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/teacher/:path*', 
    '/student/:path*',
    '/login',
    '/register/:path*'
  ]
};