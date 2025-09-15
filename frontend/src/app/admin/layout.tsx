'use client';

import { ReactNode, useEffect, useState } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MessagingChat from '@/components/realtime/MessagingChat';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState({
    name: 'Loading...',
    email: '',
    role: 'ADMIN',
  });

  useEffect(() => {
    // Get actual user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser({
        name: `${parsedUser.firstName} ${parsedUser.lastName}`,
        email: parsedUser.email,
        role: parsedUser.role,
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <DashboardSidebar userRole="ADMIN" />
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <MessagingChat />
    </div>
  );
}