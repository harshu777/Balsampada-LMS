'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import NotificationBell from '@/components/realtime/NotificationBell';
import AuthService from '@/services/auth.service';

interface DashboardHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search students, teachers, classes..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 ml-6">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-neutral-600" />
            ) : (
              <Moon className="h-5 w-5 text-neutral-600" />
            )}
          </button>

          {/* Real-time Notifications */}
          <NotificationBell />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 z-20">
                  <div className="p-4 border-b border-neutral-200">
                    <p className="font-medium text-neutral-900">{user.name}</p>
                    <p className="text-sm text-neutral-500">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                      <User className="h-4 w-4" />
                      <span className="text-sm">My Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">Settings</span>
                    </button>
                    <hr className="my-2" />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}