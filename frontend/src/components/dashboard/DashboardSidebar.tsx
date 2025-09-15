'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AuthService from '@/services/auth.service';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Bell,
  Calendar,
  BarChart3,
  Menu,
  X,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface MenuItem {
  name: string;
  href?: string;
  icon: any;
  badge?: number;
  badgeColor?: string;
  children?: {
    name: string;
    href: string;
    badge?: number;
  }[];
}

interface DashboardSidebarProps {
  userRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export default function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getMenuItems = (): MenuItem[] => {
    if (userRole === 'ADMIN') {
      return [
        {
          name: 'Dashboard',
          href: '/admin/dashboard',
          icon: LayoutDashboard,
        },
        {
          name: 'Teachers',
          icon: GraduationCap,
          badge: 3,
          badgeColor: 'bg-yellow-500',
          children: [
            { name: 'All Teachers', href: '/admin/teachers' },
            { name: 'Pending Approvals', href: '/admin/teachers/pending', badge: 3 },
            { name: 'Add Teacher', href: '/admin/teachers/add' },
          ],
        },
        {
          name: 'Students',
          icon: Users,
          badge: 5,
          badgeColor: 'bg-blue-500',
          children: [
            { name: 'All Students', href: '/admin/students' },
            { name: 'Pending Approvals', href: '/admin/students/pending', badge: 5 },
            { name: 'Add Student', href: '/admin/students/add' },
          ],
        },
        {
          name: 'Classes & Subjects',
          icon: BookOpen,
          children: [
            { name: 'Manage Classes', href: '/admin/classes' },
            { name: 'Manage Subjects', href: '/admin/subjects' },
            { name: 'Assignments', href: '/admin/assignments' },
          ],
        },
        {
          name: 'Payments',
          icon: DollarSign,
          badge: 8,
          badgeColor: 'bg-green-500',
          children: [
            { name: 'Pending Payments', href: '/admin/payments/pending', badge: 8 },
            { name: 'Payment History', href: '/admin/payments/history' },
            { name: 'Fee Structure', href: '/admin/payments/fees' },
          ],
        },
        {
          name: 'Reports',
          icon: BarChart3,
          children: [
            { name: 'Analytics', href: '/admin/reports/analytics' },
            { name: 'Performance', href: '/admin/reports/performance' },
            { name: 'Attendance', href: '/admin/reports/attendance' },
          ],
        },
        {
          name: 'Notifications',
          href: '/admin/notifications',
          icon: Bell,
          badge: 12,
          badgeColor: 'bg-red-500',
        },
        {
          name: 'Settings',
          href: '/admin/settings',
          icon: Settings,
        },
      ];
    } else if (userRole === 'TEACHER') {
      return [
        {
          name: 'Dashboard',
          href: '/teacher/dashboard',
          icon: LayoutDashboard,
        },
        {
          name: 'My Classes',
          icon: BookOpen,
          children: [
            { name: 'Schedule', href: '/teacher/classes/schedule' },
            { name: 'Live Classes', href: '/teacher/classes/live' },
            { name: 'Materials', href: '/teacher/classes/materials' },
          ],
        },
        {
          name: 'Students',
          icon: Users,
          badge: 2,
          badgeColor: 'bg-blue-500',
          children: [
            { name: 'My Students', href: '/teacher/students' },
            { name: 'Pending Approvals', href: '/teacher/students/pending', badge: 2 },
            { name: 'Attendance', href: '/teacher/students/attendance' },
          ],
        },
        {
          name: 'Assignments & Tests',
          icon: FileText,
          children: [
            { name: 'Create Assignment', href: '/teacher/assignments/create' },
            { name: 'View Submissions', href: '/teacher/assignments/submissions' },
            { name: 'Create Test', href: '/teacher/tests/create' },
            { name: 'Test Results', href: '/teacher/tests/results' },
          ],
        },
        {
          name: 'Payments',
          icon: DollarSign,
          badge: 3,
          badgeColor: 'bg-green-500',
          children: [
            { name: 'Pending Approvals', href: '/teacher/payments/pending', badge: 3 },
            { name: 'Collection History', href: '/teacher/payments/history' },
          ],
        },
        {
          name: 'Reports',
          href: '/teacher/reports',
          icon: BarChart3,
        },
        {
          name: 'Calendar',
          href: '/teacher/calendar',
          icon: Calendar,
        },
        {
          name: 'Settings',
          href: '/teacher/settings',
          icon: Settings,
        },
      ];
    } else {
      return [
        {
          name: 'Dashboard',
          href: '/student/dashboard',
          icon: LayoutDashboard,
        },
        {
          name: 'My Classes',
          icon: BookOpen,
          children: [
            { name: 'Enrolled Classes', href: '/student/classes' },
            { name: 'Live Classes', href: '/student/classes/live' },
            { name: 'Class Schedule', href: '/student/classes/schedule' },
          ],
        },
        {
          name: 'Learning Materials',
          icon: FileText,
          children: [
            { name: 'Study Materials', href: '/student/materials' },
            { name: 'Recorded Lectures', href: '/student/lectures' },
            { name: 'Downloads', href: '/student/downloads' },
          ],
        },
        {
          name: 'Assignments & Tests',
          icon: GraduationCap,
          badge: 2,
          badgeColor: 'bg-yellow-500',
          children: [
            { name: 'Pending Assignments', href: '/student/assignments', badge: 2 },
            { name: 'Upcoming Tests', href: '/student/tests' },
            { name: 'Results', href: '/student/results' },
          ],
        },
        {
          name: 'Payments',
          icon: DollarSign,
          children: [
            { name: 'Fee Status', href: '/student/payments/status' },
            { name: 'Payment History', href: '/student/payments/history' },
          ],
        },
        {
          name: 'Progress',
          href: '/student/progress',
          icon: BarChart3,
        },
        {
          name: 'Calendar',
          href: '/student/calendar',
          icon: Calendar,
        },
        {
          name: 'Settings',
          href: '/student/settings',
          icon: Settings,
        },
      ];
    }
  };

  const menuItems = getMenuItems();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children: any[]) => 
    children.some(child => pathname === child.href);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-neutral-600" />
        ) : (
          <Menu className="h-6 w-6 text-neutral-600" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-neutral-200">
            <Link href={`/${userRole.toLowerCase()}/dashboard`} className="flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Tuition LMS Logo" 
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => (
                <li key={item.name}>
                  {item.href ? (
                    // Direct link item
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary text-white'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs text-white rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ) : (
                    // Expandable item
                    <>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                          item.children && isParentActive(item.children)
                            ? 'bg-primary/10 text-primary'
                            : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className={`px-2 py-1 text-xs text-white rounded-full ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          )}
                          {expandedItems.includes(item.name) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                      {expandedItems.includes(item.name) && item.children && (
                        <ul className="mt-1 ml-8 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.name}>
                              <Link
                                href={child.href}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                  isActive(child.href)
                                    ? 'bg-primary text-white'
                                    : 'text-neutral-600 hover:bg-neutral-100'
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <span>{child.name}</span>
                                {child.badge && (
                                  <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                    {child.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-neutral-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}