'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  FileText,
  UserCheck,
  UserX,
  Eye
} from 'lucide-react';
import ApiService from '@/services/api.service';

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getDashboardStats();
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'APPROVED' })
      });
      
      if (response.ok) {
        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'REJECTED' })
      });
      
      if (response.ok) {
        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  // Calculate percentage changes (mock for now, would come from comparing with previous period)
  const calculateChange = (current: number, previous: number = 0) => {
    if (previous === 0) return { change: 0, trend: 'neutral' as const };
    const change = ((current - previous) / previous) * 100;
    return {
      change: Math.abs(change),
      trend: change > 0 ? 'up' as const : 'down' as const
    };
  };

  const stats = dashboardData ? {
    totalStudents: {
      value: dashboardData.totalStudents || 0,
      ...calculateChange(dashboardData.totalStudents || 0, dashboardData.previousStudents),
    },
    totalTeachers: {
      value: dashboardData.totalTeachers || 0,
      ...calculateChange(dashboardData.totalTeachers || 0, dashboardData.previousTeachers),
    },
    totalClasses: {
      value: dashboardData.totalClasses || 0,
      ...calculateChange(dashboardData.totalClasses || 0, dashboardData.previousClasses),
    },
    totalRevenue: {
      value: dashboardData.totalRevenue || 0,
      ...calculateChange(dashboardData.totalRevenue || 0, dashboardData.previousRevenue),
    },
  } : {
    totalStudents: { value: 0, change: 0, trend: 'neutral' as const },
    totalTeachers: { value: 0, change: 0, trend: 'neutral' as const },
    totalClasses: { value: 0, change: 0, trend: 'neutral' as const },
    totalRevenue: { value: 0, change: 0, trend: 'neutral' as const },
  };

  // Use real data from API if available, otherwise use empty arrays
  const pendingApprovals = dashboardData?.pendingApprovals || [];
  const pendingPayments = dashboardData?.pendingPayments || [];

  // Use real data from API if available, otherwise use empty arrays
  const recentActivities = dashboardData?.recentActivities || [];
  const upcomingClasses = dashboardData?.upcomingClasses || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600">Error: {error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard Overview</h1>
          <p className="text-neutral-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${stats.totalStudents.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalStudents.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{stats.totalStudents.change}%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalStudents.value.toLocaleString()}</p>
            <p className="text-sm text-neutral-600 mt-1">Total Students</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${stats.totalTeachers.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalTeachers.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{stats.totalTeachers.change}%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalTeachers.value}</p>
            <p className="text-sm text-neutral-600 mt-1">Total Teachers</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${stats.totalClasses.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalClasses.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{stats.totalClasses.change}%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">{stats.totalClasses.value}</p>
            <p className="text-sm text-neutral-600 mt-1">Active Classes</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${stats.totalRevenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalRevenue.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{stats.totalRevenue.change}%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">₹{stats.totalRevenue.value.toLocaleString()}</p>
            <p className="text-sm text-neutral-600 mt-1">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Pending Approvals</h2>
              <Link href="/admin/approvals" className="text-sm text-primary hover:text-primary/80">
                View All
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {pendingApprovals.map((approval) => (
                  <tr key={approval.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">{approval.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        approval.type === 'Teacher' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {approval.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {approval.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {approval.documents} files
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/admin/${approval.type.toLowerCase()}s/pending#${approval.id}`}
                          className="text-primary hover:text-primary/80"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleApprove(approval.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleReject(approval.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Activities</h2>
          </div>
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{activity.user}</p>
                  <p className="text-sm text-neutral-600">{activity.action}</p>
                  <p className="text-xs text-neutral-500 mt-1">{activity.subject}</p>
                  <p className="text-xs text-neutral-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payments */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Pending Payments</h2>
              <Link href="/admin/payments" className="text-sm text-primary hover:text-primary/80">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{payment.student}</p>
                    <p className="text-sm text-neutral-600">{payment.class}</p>
                    <p className="text-xs text-neutral-500 mt-1">Due: {payment.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900">₹{payment.amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'overdue' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.status === 'overdue' ? 'Overdue' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Today's Classes</h2>
              <Link href="/admin/schedule" className="text-sm text-primary hover:text-primary/80">
                View Schedule
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingClasses.map((class_) => (
                <div key={class_.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{class_.subject}</p>
                      <p className="text-sm text-neutral-600">{class_.teacher} • {class_.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-900">{class_.time}</p>
                    <p className="text-sm text-neutral-600">{class_.students} students</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}