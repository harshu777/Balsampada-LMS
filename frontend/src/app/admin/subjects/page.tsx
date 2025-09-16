'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  BookOpenIcon,
  UsersIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import SubjectService, { Subject, CreateSubjectDto, UpdateSubjectDto } from '@/services/subject.service';
import ClassService, { Class } from '@/services/class.service';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSubjectDto | UpdateSubjectDto) => void;
  subjectData?: Subject | null;
  isLoading?: boolean;
  classes: Class[];
}

function SubjectModal({ isOpen, onClose, onSave, subjectData, isLoading, classes }: SubjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    classId: '',
    isActive: true,
  });

  useEffect(() => {
    if (subjectData) {
      setFormData({
        name: subjectData.name,
        description: subjectData.description || '',
        classId: subjectData.classId,
        isActive: subjectData.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        classId: '',
        isActive: true,
      });
    }
  }, [subjectData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      description: formData.description || undefined,
    };
    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {subjectData ? 'Edit Subject' : 'Create New Subject'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Algebra, Physics, Chemistry"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class *
            </label>
            <select
              required
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {ClassService.formatClassName(cls)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Brief description of the subject..."
            />
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
              Active Subject
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
              {isLoading ? 'Saving...' : (subjectData ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [classFilter, setClassFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadSubjects = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active';
      }

      if (classFilter) {
        params.classId = classFilter;
      }

      const response = await SubjectService.getSubjects(params);
      setSubjects(response.subjects || []);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const allClasses = await ClassService.getAllActiveClasses();
      setClasses(allClasses);
    } catch (err: any) {
      console.error('Failed to load classes:', err);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [searchQuery, statusFilter, classFilter]);

  const handleCreateSubject = async (data: CreateSubjectDto) => {
    try {
      setIsSubmitting(true);
      await SubjectService.createSubject(data);
      setIsModalOpen(false);
      setSelectedSubject(null);
      loadSubjects(currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to create subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubject = async (data: UpdateSubjectDto) => {
    if (!selectedSubject) return;
    
    try {
      setIsSubmitting(true);
      await SubjectService.updateSubject(selectedSubject.id, data);
      setIsModalOpen(false);
      setSelectedSubject(null);
      loadSubjects(currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to update subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (!confirm(`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await SubjectService.deleteSubject(subject.id);
      loadSubjects(currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to delete subject');
    }
  };

  const openEditModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedSubject(null);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    loadSubjects(page);
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
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600">Manage subjects and assign teachers</p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={classes.length === 0}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={classes.length === 0 ? 'Create at least one class first' : ''}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Subject
        </button>
      </div>

      {classes.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            You need to create at least one class before you can add subjects.{' '}
            <a href="/admin/classes" className="underline hover:text-yellow-900">
              Create a class here
            </a>
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {ClassService.formatClassName(cls)}
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
        </div>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {subject.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {SubjectService.formatClassName(subject)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subject.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {subject.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {subject.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {subject.description}
                  </p>
                )}

                {/* Teachers */}
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>Teachers ({subject._count?.teachers || 0})</span>
                  </div>
                  <div className="text-sm">
                    {subject.teachers && subject.teachers.length > 0 ? (
                      <div className="space-y-1">
                        {subject.teachers.slice(0, 2).map((ts) => (
                          <div key={ts.id} className="text-gray-700">
                            {ts.teacher.firstName} {ts.teacher.lastName}
                          </div>
                        ))}
                        {subject.teachers.length > 2 && (
                          <div className="text-gray-500">
                            +{subject.teachers.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">No teachers assigned</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-gray-600">
                      {subject._count?.enrollments || 0} students
                    </span>
                  </div>
                  <div className="flex items-center">
                    <BookOpenIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-gray-600">
                      {(subject._count?.materials || 0) + (subject._count?.assignments || 0)} items
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`/admin/subjects/${subject.id}`, '_blank')}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="View details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(subject)}
                      className="p-2 text-gray-400 hover:text-green-600"
                      title="Edit subject"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete subject"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    Created {new Date(subject.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && subjects.length === 0 && classes.length > 0 && (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' || classFilter
              ? 'No subjects match your search criteria.' 
              : 'Get started by creating your first subject.'}
          </p>
          {(!searchQuery && statusFilter === 'all' && !classFilter) && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create First Subject
            </button>
          )}
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

      {/* Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSubject(null);
        }}
        onSave={(data: any) => {
          if (selectedSubject) {
            handleUpdateSubject(data);
          } else {
            handleCreateSubject(data);
          }
        }}
        subjectData={selectedSubject}
        isLoading={isSubmitting}
        classes={classes}
      />
    </div>
  );
}