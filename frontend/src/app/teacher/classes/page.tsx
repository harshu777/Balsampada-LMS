'use client';

import React, { useState, useEffect } from 'react';
import { 
  EyeIcon,
  BookOpenIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import SubjectService, { Subject } from '@/services/subject.service';
import EnrollmentService, { StudentEnrollment } from '@/services/enrollment.service';

export default function TeacherClassesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadSubjects = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12 };
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await SubjectService.getMySubjects(params);
      setSubjects(response.subjects || []);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    loadSubjects(page);
  };

  const handleViewSubjectDetails = (subjectId: string) => {
    window.location.href = `/teacher/classes/${subjectId}`;
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => { setError(null); loadSubjects(); }}
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
          <p className="text-gray-600">Subjects assigned to you and their students</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {subject.class?.name}
                      {subject.class?.grade && ` - Grade ${subject.class.grade}`}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>

                {subject.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {subject.description}
                  </p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <UsersIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-blue-900">
                          {subject._count?.enrollments || 0}
                        </div>
                        <div className="text-xs text-blue-600">Students</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <BookOpenIcon className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-green-900">
                          {subject._count?.materials || 0}
                        </div>
                        <div className="text-xs text-green-600">Materials</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-yellow-900">
                          {subject._count?.assignments || 0}
                        </div>
                        <div className="text-xs text-yellow-600">Assignments</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-purple-900">
                          {subject._count?.tests || 0}
                        </div>
                        <div className="text-xs text-purple-600">Tests</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Activity</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    {subject.assignments && subject.assignments.length > 0 ? (
                      subject.assignments.slice(0, 2).map((assignment) => (
                        <div key={assignment.id} className="flex items-center">
                          <ClipboardDocumentListIcon className="h-3 w-3 mr-1" />
                          <span className="truncate">{assignment.title}</span>
                        </div>
                      ))
                    ) : subject.materials && subject.materials.length > 0 ? (
                      subject.materials.slice(0, 2).map((material) => (
                        <div key={material.id} className="flex items-center">
                          <BookOpenIcon className="h-3 w-3 mr-1" />
                          <span className="truncate">{material.title}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic">No recent activity</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <button
                    onClick={() => handleViewSubjectDetails(subject.id)}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`/teacher/assignments?subject=${subject.id}`, '_blank')}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="View assignments"
                    >
                      <ClipboardDocumentListIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(`/teacher/materials?subject=${subject.id}`, '_blank')}
                      className="p-2 text-gray-400 hover:text-green-600"
                      title="View materials"
                    >
                      <BookOpenIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(`/teacher/analytics?subject=${subject.id}`, '_blank')}
                      className="p-2 text-gray-400 hover:text-purple-600"
                      title="View analytics"
                    >
                      <ChartBarIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && subjects.length === 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects assigned</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? 'No subjects match your search criteria.' 
              : 'You have not been assigned to any subjects yet. Contact your administrator to get started.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && subjects.length > 0 && totalPages > 1 && (
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