'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Trophy,
} from 'lucide-react';
import testService, { Test, PaginatedTests } from '@/services/test.service';

export default function TeacherTestsPage() {
  const [tests, setTests] = useState<PaginatedTests | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const data = await testService.getTests({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        subjectId: selectedSubject || undefined,
        isActive: isActiveFilter,
      });
      setTests(data);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [currentPage, searchQuery, selectedSubject, isActiveFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTests();
  };

  const handleDeleteTest = async (id: string) => {
    try {
      await testService.deleteTest(id);
      setShowDeleteModal(false);
      setTestToDelete(null);
      fetchTests();
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  };

  const getStatusBadge = (test: Test) => {
    const status = testService.getTestStatus(test);
    const colorClass = testService.getStatusColor(status);

    const icons = {
      upcoming: Clock,
      ongoing: CheckCircle,
      completed: Trophy,
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading && !tests) {
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
          <h1 className="text-2xl font-bold text-gray-900">Tests</h1>
          <p className="text-gray-600">Manage your tests and track student performance</p>
        </div>
        <Link
          href="/teacher/tests/create"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Test
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Subjects</option>
            {/* TODO: Populate with actual subjects */}
          </select>
          <select
            value={isActiveFilter === undefined ? '' : isActiveFilter.toString()}
            onChange={(e) => setIsActiveFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </form>
      </div>

      {/* Tests List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {tests && tests.tests.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Test</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Subject</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Schedule</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Duration</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Attempts</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.tests.map((test) => (
                    <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 rounded-lg p-2 flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{test.title}</h3>
                            {test.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {test.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <p className="text-xs text-gray-400">
                                {test.questions.length} Questions
                              </p>
                              <p className="text-xs text-gray-400">
                                Total: {test.totalMarks} Marks
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{test.subject.name}</p>
                          <p className="text-sm text-gray-500">
                            {test.subject.class.name}
                            {test.subject.class.grade && ` - Grade ${test.subject.class.grade}`}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-900">
                              {new Date(test.startTime).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(test.startTime).toLocaleTimeString()} - {new Date(test.endTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {testService.formatDuration(test.duration)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {test._count.attempts}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(test)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/teacher/tests/${test.id}`}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/teacher/tests/${test.id}/edit`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setTestToDelete(test.id);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {tests.pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Showing {((tests.pagination.page - 1) * tests.pagination.limit) + 1} to{' '}
                  {Math.min(tests.pagination.page * tests.pagination.limit, tests.pagination.total)} of{' '}
                  {tests.pagination.total} results
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(tests.pagination.totalPages)].map((_, index) => (
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
                    disabled={currentPage === tests.pagination.totalPages}
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
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first test</p>
            <Link
              href="/teacher/tests/create"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Test
            </Link>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Delete Test</h3>
            </div>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete this test? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTestToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => testToDelete && handleDeleteTest(testToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}