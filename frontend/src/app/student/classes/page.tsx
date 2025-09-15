'use client';

import React, { useState, useEffect } from 'react';
import { 
  EyeIcon,
  BookOpenIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import EnrollmentService, { StudentEnrollment } from '@/services/enrollment.service';

export default function StudentClassesPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadEnrollments = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12 };
      
      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active';
      }

      const response = await EnrollmentService.getMyEnrollments(params);
      const filteredEnrollments = searchQuery 
        ? (response.enrollments || []).filter(enrollment =>
            enrollment.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enrollment.subject.class.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : response.enrollments || [];
      
      setEnrollments(filteredEnrollments);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Failed to load your enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, [statusFilter]);

  useEffect(() => {
    // Simple client-side search
    loadEnrollments(1);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    loadEnrollments(page);
  };

  const handleViewClassDetails = (subjectId: string) => {
    window.location.href = `/student/classes/${subjectId}`;
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'REJECTED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => { setError(null); loadEnrollments(); }}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600">Your enrolled subjects and class materials</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search subjects and classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900">
                {enrollments.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {enrollments.filter(e => e.isActive).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending Payment</p>
              <p className="text-2xl font-bold text-gray-900">
                {enrollments.filter(e => e.paymentStatus === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {enrollment.subject.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {enrollment.subject.class.name}
                      {enrollment.subject.class.grade && ` - Grade ${enrollment.subject.class.grade}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      enrollment.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {enrollment.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center">
                      {getPaymentStatusIcon(enrollment.paymentStatus)}
                    </div>
                  </div>
                </div>

                {/* Teachers */}
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    <span>Teachers</span>
                  </div>
                  <div className="text-sm">
                    {enrollment.subject.teachers && enrollment.subject.teachers.length > 0 ? (
                      <div className="space-y-1">
                        {enrollment.subject.teachers.slice(0, 2).map((ts) => (
                          <div key={ts.id} className="text-gray-700">
                            {ts.teacher.firstName} {ts.teacher.lastName}
                          </div>
                        ))}
                        {enrollment.subject.teachers.length > 2 && (
                          <div className="text-gray-500">
                            +{enrollment.subject.teachers.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">No teachers assigned</span>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <div className="font-medium text-blue-900">
                      {enrollment.subject.materials?.length || 0}
                    </div>
                    <div className="text-blue-600">Materials</div>
                  </div>
                  
                  <div className="bg-yellow-50 p-2 rounded text-center">
                    <div className="font-medium text-yellow-900">
                      {enrollment.subject.assignments?.length || 0}
                    </div>
                    <div className="text-yellow-600">Assignments</div>
                  </div>

                  <div className="bg-purple-50 p-2 rounded text-center">
                    <div className="font-medium text-purple-900">
                      {enrollment.subject.tests?.length || 0}
                    </div>
                    <div className="text-purple-600">Tests</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Activity</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    {enrollment.subject.assignments && enrollment.subject.assignments.length > 0 ? (
                      enrollment.subject.assignments.slice(0, 2).map((assignment) => (
                        <div key={assignment.id} className="flex items-center">
                          <ClipboardDocumentListIcon className="h-3 w-3 mr-1 text-yellow-600" />
                          <span className="truncate">{assignment.title}</span>
                        </div>
                      ))
                    ) : enrollment.subject.materials && enrollment.subject.materials.length > 0 ? (
                      enrollment.subject.materials.slice(0, 2).map((material) => (
                        <div key={material.id} className="flex items-center">
                          <BookOpenIcon className="h-3 w-3 mr-1 text-blue-600" />
                          <span className="truncate">{material.title}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic">No recent activity</div>
                    )}
                  </div>
                </div>

                {/* Enrollment Info */}
                <div className="text-xs text-gray-500 mb-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    <span>
                      Enrolled: {EnrollmentService.formatEnrollmentDate(enrollment.enrollmentDate)}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span>
                      Duration: {EnrollmentService.getEnrollmentDuration(enrollment)}
                    </span>
                  </div>
                </div>

                {/* Payment Status Details */}
                <div className={`p-3 rounded-lg mb-4 text-sm ${
                  EnrollmentService.getPaymentStatusColor(enrollment.paymentStatus)
                }`}>
                  <div className="font-medium">
                    Payment: {EnrollmentService.formatPaymentStatus(enrollment.paymentStatus)}
                  </div>
                  {enrollment.payments && enrollment.payments.length > 0 && (
                    <div className="text-xs mt-1">
                      Latest: {new Date(enrollment.payments[0].paymentDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <button
                    onClick={() => handleViewClassDetails(enrollment.subject.id)}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Class
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`/student/assignments?subject=${enrollment.subject.id}`, '_blank')}
                      className="p-2 text-gray-400 hover:text-yellow-600"
                      title="View assignments"
                    >
                      <ClipboardDocumentListIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(`/student/materials?subject=${enrollment.subject.id}`, '_blank')}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="View materials"
                    >
                      <BookOpenIcon className="h-4 w-4" />
                    </button>
                    {enrollment.paymentStatus === 'PENDING' && (
                      <button
                        onClick={() => window.open(`/student/payments?enrollment=${enrollment.id}`, '_blank')}
                        className="p-2 text-gray-400 hover:text-green-600"
                        title="Make payment"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && enrollments.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'No enrollments match your search criteria.' 
              : 'You are not enrolled in any subjects yet. Contact your administrator to enroll in classes.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && enrollments.length > 0 && totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 border rounded-md ${
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}