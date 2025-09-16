'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  BookOpen,
  User,
  Download,
} from 'lucide-react';
import assignmentService, { StudentAssignment, PaginatedStudentAssignments } from '@/services/assignment.service';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<PaginatedStudentAssignments | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'submitted' | 'graded' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getMyAssignments({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
      });
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [currentPage, statusFilter]);

  const getStatusBadge = (assignment: StudentAssignment) => {
    if (assignment.gradedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Graded
        </span>
      );
    }

    if (assignment.submittedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          Submitted
        </span>
      );
    }

    const dueDate = new Date(assignment.assignment!.dueDate);
    const now = new Date();
    const isOverdue = now > dueDate;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isOverdue 
          ? 'bg-red-100 text-red-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        <AlertCircle className="w-3 h-3 mr-1" />
        {isOverdue ? 'Overdue' : 'Pending'}
      </span>
    );
  };

  const getGradeDisplay = (assignment: StudentAssignment) => {
    if (assignment.gradedAt && assignment.marksObtained !== null && assignment.marksObtained !== undefined && assignment.assignment?.totalMarks) {
      const percentage = ((assignment.marksObtained / assignment.assignment.totalMarks) * 100).toFixed(1);
      return (
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">
            {assignment.marksObtained}/{assignment.assignment.totalMarks}
          </p>
          <p className="text-sm text-gray-500">{percentage}%</p>
        </div>
      );
    }
    return <span className="text-gray-400">-</span>;
  };

  if (loading && !assignments) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600">View and submit your assignments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 rounded-lg p-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {assignments?.assignments.filter(a => !a.submittedAt).length || 0}
              </p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {assignments?.assignments.filter(a => a.submittedAt && !a.gradedAt).length || 0}
              </p>
              <p className="text-sm text-gray-500">Submitted</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {assignments?.assignments.filter(a => a.gradedAt).length || 0}
              </p>
              <p className="text-sm text-gray-500">Graded</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-lg p-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {assignments?.assignments.filter(a => 
                  !a.submittedAt && new Date() > new Date(a.assignment!.dueDate)
                ).length || 0}
              </p>
              <p className="text-sm text-gray-500">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Assignments</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {assignments && assignments.assignments.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Assignment</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Subject</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Teacher</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Due Date</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Grade</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.assignments.map((assignment) => (
                    <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 rounded-lg p-2 flex-shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{assignment.assignment!.title}</h3>
                            {assignment.assignment!.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {assignment.assignment!.description}
                              </p>
                            )}
                            {assignment.assignment!.totalMarks && (
                              <p className="text-xs text-gray-400 mt-1">
                                Total Marks: {assignment.assignment!.totalMarks}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{assignment.assignment!.subject.name}</p>
                            <p className="text-sm text-gray-500">
                              {assignment.assignment!.subject.class.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {assignment.assignment!.teacher.firstName} {assignment.assignment!.teacher.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {assignment.assignment!.teacher.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(assignment.assignment!.dueDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {assignmentService.formatDueDate(assignment.assignment!.dueDate)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getGradeDisplay(assignment)}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(assignment)}
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          href={`/student/assignments/${assignment.assignment!.id}`}
                          className="bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                        >
                          {assignment.submittedAt ? 'View' : 'Submit'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {assignments.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Showing {((assignments.pagination.page - 1) * assignments.pagination.limit) + 1} to{' '}
                  {Math.min(assignments.pagination.page * assignments.pagination.limit, assignments.pagination.total)} of{' '}
                  {assignments.pagination.total} results
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(assignments.pagination.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === index + 1
                          ? 'bg-primary text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === assignments.pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-500">
              {statusFilter 
                ? `No ${statusFilter} assignments found. Try changing the filter.`
                : 'You don\'t have any assignments yet. Check back later.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}