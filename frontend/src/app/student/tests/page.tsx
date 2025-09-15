'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  Play,
  CheckCircle,
  AlertCircle,
  Trophy,
} from 'lucide-react';
import testService, { Test, StudentTest, PaginatedStudentTests } from '@/services/test.service';

export default function StudentTestsPage() {
  const [tests, setTests] = useState<PaginatedStudentTests | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'ongoing' | 'completed' | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const data = await testService.getMyTests({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
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
  }, [currentPage, statusFilter]);

  const getTestStatus = (test: Test & { attempts: StudentTest[] }) => {
    const status = testService.getTestStatus(test);
    const attemptStatus = testService.getAttemptStatus(test);
    
    if (status === 'completed' && attemptStatus === 'submitted') {
      return { label: 'Completed', color: 'bg-green-100 text-green-800', icon: Trophy };
    } else if (status === 'ongoing' && attemptStatus === 'in_progress') {
      return { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Clock };
    } else if (status === 'ongoing' && attemptStatus === 'not_started') {
      return { label: 'Available', color: 'bg-green-100 text-green-800', icon: Play };
    } else if (status === 'upcoming') {
      return { label: 'Upcoming', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    } else if (status === 'completed' && attemptStatus === 'not_started') {
      return { label: 'Missed', color: 'bg-red-100 text-red-800', icon: AlertCircle };
    } else {
      return { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
    }
  };

  const getActionButton = (test: Test & { attempts: StudentTest[] }) => {
    const status = testService.getTestStatus(test);
    const attemptStatus = testService.getAttemptStatus(test);

    if (status === 'ongoing' && attemptStatus === 'not_started') {
      return (
        <Link
          href={`/student/tests/${test.id}`}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Start Test
        </Link>
      );
    } else if (status === 'ongoing' && attemptStatus === 'in_progress') {
      return (
        <Link
          href={`/student/tests/${test.id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Continue
        </Link>
      );
    } else if (attemptStatus === 'submitted') {
      return (
        <Link
          href={`/student/tests/${test.id}/results`}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          View Results
        </Link>
      );
    } else {
      return (
        <Link
          href={`/student/tests/${test.id}`}
          className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed inline-flex items-center gap-2"
        >
          View Details
        </Link>
      );
    }
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
          <h1 className="text-2xl font-bold text-gray-900">My Tests</h1>
          <p className="text-gray-600">View and take your scheduled tests</p>
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
                {tests?.tests.filter(t => testService.getTestStatus(t) === 'upcoming').length || 0}
              </p>
              <p className="text-sm text-gray-500">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-3">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tests?.tests.filter(t => 
                  testService.getTestStatus(t) === 'ongoing' && 
                  testService.getAttemptStatus(t) === 'not_started'
                ).length || 0}
              </p>
              <p className="text-sm text-gray-500">Available</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tests?.tests.filter(t => testService.getAttemptStatus(t) === 'in_progress').length || 0}
              </p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-3">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tests?.tests.filter(t => testService.getAttemptStatus(t) === 'submitted').length || 0}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
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
            <option value="">All Tests</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Available/Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tests List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {tests && tests.tests.length > 0 ? (
          <>
            <div className="divide-y divide-gray-200">
              {tests.tests.map((test) => {
                const testStatus = getTestStatus(test);
                const StatusIcon = testStatus.icon;

                return (
                  <div key={test.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {test.title}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${testStatus.color} ml-3`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {testStatus.label}
                            </span>
                          </div>
                          
                          {test.description && (
                            <p className="text-gray-600 mb-3 line-clamp-2">{test.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-gray-500">Subject</p>
                                <p className="font-medium text-gray-900">{test.subject.name}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-gray-500">Teacher</p>
                                <p className="font-medium text-gray-900">
                                  {test.teacher.firstName} {test.teacher.lastName}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-gray-500">Schedule</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(test.startTime).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(test.startTime).toLocaleTimeString()} - {new Date(test.endTime).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-gray-500">Duration</p>
                                <p className="font-medium text-gray-900">
                                  {testService.formatDuration(test.duration)}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                            <span>{test.questions.length} Questions</span>
                            <span>{test.totalMarks} Marks</span>
                            {test.attempts.length > 0 && test.attempts[0].marksObtained !== null && (
                              <span className="text-primary font-medium">
                                Score: {test.attempts[0].marksObtained}/{test.totalMarks}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex-shrink-0">
                        {getActionButton(test)}
                      </div>
                    </div>
                  </div>
                );
              })}
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
            <p className="text-gray-500">
              {statusFilter 
                ? `No ${statusFilter} tests found. Try changing the filter.`
                : 'You don\'t have any tests yet. Check back later.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}