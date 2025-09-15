'use client';

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  AcademicCapIcon,
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import ClassService, { Class, CreateClassDto, UpdateClassDto } from '@/services/class.service';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateClassDto | UpdateClassDto) => void;
  classData?: Class | null;
  isLoading?: boolean;
}

function ClassModal({ isOpen, onClose, onSave, classData, isLoading }: ClassModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade: '',
    academicYear: '',
    isActive: true,
  });

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        description: classData.description || '',
        grade: classData.grade || '',
        academicYear: classData.academicYear || '',
        isActive: classData.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        grade: '',
        academicYear: '',
        isActive: true,
      });
    }
  }, [classData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      description: formData.description || undefined,
      grade: formData.grade || undefined,
      academicYear: formData.academicYear || undefined,
    };
    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">
          {classData ? 'Edit Class' : 'Create New Class'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Mathematics Advanced"
            />
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
              placeholder="Brief description of the class..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10, 11, 12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2024-25"
              />
            </div>
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
              Active Class
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
              {isLoading ? 'Saving...' : (classData ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadClasses = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active';
      }

      const response = await ClassService.getClasses(params);
      setClasses(response.classes || []);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [searchQuery, statusFilter]);

  const handleCreateClass = async (data: CreateClassDto) => {
    try {
      setIsSubmitting(true);
      await ClassService.createClass(data);
      setIsModalOpen(false);
      setSelectedClass(null);
      loadClasses(currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to create class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClass = async (data: UpdateClassDto) => {
    if (!selectedClass) return;
    
    try {
      setIsSubmitting(true);
      await ClassService.updateClass(selectedClass.id, data);
      setIsModalOpen(false);
      setSelectedClass(null);
      loadClasses(currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to update class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async (classItem: Class) => {
    if (!confirm(`Are you sure you want to delete "${classItem.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await ClassService.deleteClass(classItem.id);
      loadClasses(currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to delete class');
    }
  };

  const openEditModal = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    loadClasses(page);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => { setError(null); loadClasses(); }}
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
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600">Manage your tuition classes</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Class
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search classes..."
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

      {/* Classes Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div key={classItem.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {classItem.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      {classItem.grade && (
                        <span className="mr-3">Grade {classItem.grade}</span>
                      )}
                      {classItem.academicYear && (
                        <span>{classItem.academicYear}</span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    classItem.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {classItem.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {classItem.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {classItem.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center">
                    <BookOpenIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-gray-600">
                      {classItem._count?.subjects || 0} subjects
                    </span>
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-gray-600">
                      {ClassService.getTotalStudents(classItem)} students
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`/admin/classes/${classItem.id}`, '_blank')}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="View details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(classItem)}
                      className="p-2 text-gray-400 hover:text-green-600"
                      title="Edit class"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(classItem)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete class"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    Created {new Date(classItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && classes.length === 0 && (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'No classes match your search criteria.' 
              : 'Get started by creating your first class.'}
          </p>
          {(!searchQuery && statusFilter === 'all') && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create First Class
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && classes.length > 0 && totalPages > 1 && (
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
      <ClassModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClass(null);
        }}
        onSave={selectedClass ? handleUpdateClass : handleCreateClass}
        classData={selectedClass}
        isLoading={isSubmitting}
      />
    </div>
  );
}