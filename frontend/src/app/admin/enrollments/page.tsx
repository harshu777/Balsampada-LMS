'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  BookOpenIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import EnrollmentService, { 
  StudentEnrollment, 
  CreateEnrollmentDto, 
  PaymentStatus 
} from '@/services/enrollment.service';
import SubjectService, { Subject } from '@/services/subject.service';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateEnrollmentDto) => void;
  isLoading?: boolean;
  subjects: Subject[];
  students: User[];
}

function EnrollmentModal({ isOpen, onClose, onSave, isLoading, subjects, students }: EnrollmentModalProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'PENDING' as PaymentStatus,
    isActive: false,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        studentId: '',
        subjectId: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'PENDING' as PaymentStatus,
        isActive: false,
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Create New Enrollment</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student *
            </label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} ({student.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <select
              required
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {SubjectService.formatSubjectName(subject)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enrollment Date
            </label>
            <input
              type="date"
              value={formData.enrollmentDate}
              onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active Enrollment
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);

  const loadEnrollments = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active';
      }

      if (paymentFilter !== 'all') {
        params.paymentStatus = paymentFilter;
      }

      if (subjectFilter) {
        params.subjectId = subjectFilter;
      }

      const response = await EnrollmentService.getEnrollments(params);
      setEnrollments(response.enrollments || []);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const allSubjects = await SubjectService.getAllActiveSubjects();
      setSubjects(allSubjects);
    } catch (err: any) {
      console.error('Failed to load subjects:', err);
    }
  };

  const loadStudents = async () => {
    try {
      // This would normally be a call to a user service to get students
      // For now, we'll use a placeholder
      setStudents([]);
    } catch (err: any) {
      console.error('Failed to load students:', err);
    }
  };

  useEffect(() => {
    loadSubjects();
    loadStudents();
  }, []);

  useEffect(() => {
    loadEnrollments();
  }, [searchQuery, statusFilter, paymentFilter, subjectFilter]);

  const handleCreateEnrollment = async (data: CreateEnrollmentDto) => {
    try {
      setIsSubmitting(true);
      await EnrollmentService.createEnrollment(data);
      setIsModalOpen(false);
      loadEnrollments(currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to create enrollment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEnrollmentStatus = async (id: string, isActive: boolean, paymentStatus?: PaymentStatus) => {
    try {
      await EnrollmentService.updateEnrollmentStatus(id, { isActive, paymentStatus });
      loadEnrollments(currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to update enrollment');
    }
  };

  const handleBulkUpdate = async (isActive: boolean, paymentStatus?: PaymentStatus) => {
    if (selectedEnrollments.length === 0) return;
    
    try {
      await EnrollmentService.bulkUpdateEnrollments({
        enrollmentIds: selectedEnrollments,
        isActive,
        paymentStatus,
      });
      setSelectedEnrollments([]);
      loadEnrollments(currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to update enrollments');
    }
  };

  const handlePageChange = (page: number) => {
    loadEnrollments(page);
  };

  const toggleEnrollmentSelection = (id: string) => {
    setSelectedEnrollments(prev => 
      prev.includes(id) 
        ? prev.filter(enrollmentId => enrollmentId !== id)
        : [...prev, id]
    );
  };

  const selectAllEnrollments = () => {
    setSelectedEnrollments(
      selectedEnrollments.length === enrollments.length 
        ? [] 
        : enrollments.map(e => e.id)
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
          <p className="text-gray-600">Manage student enrollments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={subjects.length === 0}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          title={subjects.length === 0 ? 'Create subjects first' : ''}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Enrollment
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedEnrollments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedEnrollments.length} enrollment(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkUpdate(true)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkUpdate(false)}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkUpdate(true, 'APPROVED')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Approve Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search students or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {SubjectService.formatSubjectName(subject)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Payment Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PARTIAL">Partial</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEnrollments.length === enrollments.length && enrollments.length > 0}
                      onChange={selectAllEnrollments}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEnrollments.includes(enrollment.id)}
                        onChange={() => toggleEnrollmentSelection(enrollment.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {EnrollmentService.formatStudentName(enrollment)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {enrollment.student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {enrollment.subject.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.subject.class.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {EnrollmentService.formatEnrollmentDate(enrollment.enrollmentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        enrollment.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        EnrollmentService.getPaymentStatusColor(enrollment.paymentStatus)
                      }`}>
                        {EnrollmentService.formatPaymentStatus(enrollment.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/admin/enrollments/${enrollment.id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {enrollment.isActive ? (
                          <button
                            onClick={() => handleUpdateEnrollmentStatus(enrollment.id, false)}
                            className="text-red-600 hover:text-red-900"
                            title="Deactivate"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateEnrollmentStatus(enrollment.id, true)}
                            className="text-green-600 hover:text-green-900"
                            title="Activate"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && enrollments.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' || subjectFilter
              ? 'No enrollments match your search criteria.' 
              : 'Get started by creating your first enrollment.'}
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

      {/* Modal */}
      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateEnrollment}
        isLoading={isSubmitting}
        subjects={subjects}
        students={students}
      />
    </div>
  );
}