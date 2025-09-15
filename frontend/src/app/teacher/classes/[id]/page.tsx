'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ArrowLeftIcon,
  UsersIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import SubjectService, { Subject } from '@/services/subject.service';
import EnrollmentService, { StudentEnrollment } from '@/services/enrollment.service';

interface TabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function TabNavigation({ activeTab, setActiveTab }: TabProps) {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: BookOpenIcon },
    { id: 'students', name: 'Students', icon: UsersIcon },
    { id: 'materials', name: 'Materials', icon: BookOpenIcon },
    { id: 'assignments', name: 'Assignments', icon: ClipboardDocumentListIcon },
    { id: 'tests', name: 'Tests', icon: AcademicCapIcon },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function OverviewTab({ subject }: { subject: Subject }) {
  return (
    <div className="space-y-6">
      {/* Subject Info */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subject Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">Subject Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{subject.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Class</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {subject.class?.name}
              {subject.class?.grade && ` - Grade ${subject.class.grade}`}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Academic Year</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {subject.class?.academicYear || 'Not specified'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                subject.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {subject.isActive ? 'Active' : 'Inactive'}
              </span>
            </dd>
          </div>
        </div>
        {subject.description && (
          <div className="mt-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">{subject.description}</dd>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {subject._count?.enrollments || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Materials</p>
              <p className="text-2xl font-bold text-gray-900">
                {subject._count?.materials || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <ClipboardDocumentListIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Assignments</p>
              <p className="text-2xl font-bold text-gray-900">
                {subject._count?.assignments || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tests</p>
              <p className="text-2xl font-bold text-gray-900">
                {subject._count?.tests || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {subject.assignments && subject.assignments.length > 0 ? (
            subject.assignments.slice(0, 3).map((assignment) => (
              <div key={assignment.id} className="flex items-start space-x-3">
                <ClipboardDocumentListIcon className="h-5 w-5 text-yellow-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : subject.materials && subject.materials.length > 0 ? (
            subject.materials.slice(0, 3).map((material) => (
              <div key={material.id} className="flex items-start space-x-3">
                <BookOpenIcon className="h-5 w-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{material.title}</p>
                  <p className="text-sm text-gray-500">
                    Added: {new Date(material.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentsTab({ subject }: { subject: Subject }) {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const response = await EnrollmentService.getEnrollmentsBySubject(
          subject.id,
          { page: 1, limit: 100, isActive: true }
        );
        setEnrollments(response.enrollments || []);
      } catch (error) {
        console.error('Failed to load students:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [subject.id]);

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enrollment.student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enrollment.student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Students ({filteredEnrollments.length})
          </h3>
        </div>
        
        {filteredEnrollments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {enrollment.student.firstName[0]}
                        {enrollment.student.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {enrollment.student.firstName} {enrollment.student.lastName}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {enrollment.student.email}
                        </div>
                        {enrollment.student.phone && (
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {enrollment.student.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      EnrollmentService.getPaymentStatusColor(enrollment.paymentStatus)
                    }`}>
                      {EnrollmentService.formatPaymentStatus(enrollment.paymentStatus)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Enrolled: {EnrollmentService.formatEnrollmentDate(enrollment.enrollmentDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900">No students found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'No students match your search.' : 'No students enrolled in this subject.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MaterialsTab({ subject }: { subject: Subject }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Materials</h3>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Material
        </button>
      </div>
      
      {subject.materials && subject.materials.length > 0 ? (
        <div className="space-y-4">
          {subject.materials.map((material) => (
            <div key={material.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{material.title}</h4>
                  {material.description && (
                    <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Type: {material.type}</span>
                    <span>Added: {new Date(material.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {material.fileUrl && (
                    <button
                      onClick={() => window.open(material.fileUrl, '_blank')}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="View file"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-green-600" title="Edit">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No materials yet</h3>
          <p className="text-sm text-gray-500">Start by adding your first material.</p>
        </div>
      )}
    </div>
  );
}

function AssignmentsTab({ subject }: { subject: Subject }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Assignments</h3>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Assignment
        </button>
      </div>
      
      {subject.assignments && subject.assignments.length > 0 ? (
        <div className="space-y-4">
          {subject.assignments.map((assignment) => (
            <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{assignment.title}</h4>
                  {assignment.description && (
                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-blue-600" title="View">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600" title="Edit">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No assignments yet</h3>
          <p className="text-sm text-gray-500">Create your first assignment to get started.</p>
        </div>
      )}
    </div>
  );
}

function TestsTab({ subject }: { subject: Subject }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Tests</h3>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Test
        </button>
      </div>
      
      {subject.tests && subject.tests.length > 0 ? (
        <div className="space-y-4">
          {subject.tests.map((test) => (
            <div key={test.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{test.title}</h4>
                  {test.description && (
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Start: {new Date(test.startTime).toLocaleString()}</span>
                    <span>End: {new Date(test.endTime).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-blue-600" title="View">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600" title="Edit">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No tests yet</h3>
          <p className="text-sm text-gray-500">Create your first test to get started.</p>
        </div>
      )}
    </div>
  );
}

export default function TeacherClassDetailPage() {
  const params = useParams();
  const subjectId = params?.id as string;
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!subjectId) return;

    const loadSubject = async () => {
      try {
        setLoading(true);
        const subjectData = await SubjectService.getSubject(subjectId);
        setSubject(subjectData);
      } catch (err: any) {
        setError(err.message || 'Failed to load subject details');
      } finally {
        setLoading(false);
      }
    };

    loadSubject();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error || 'Subject not found'}</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab subject={subject} />;
      case 'students':
        return <StudentsTab subject={subject} />;
      case 'materials':
        return <MaterialsTab subject={subject} />;
      case 'assignments':
        return <AssignmentsTab subject={subject} />;
      case 'tests':
        return <TestsTab subject={subject} />;
      default:
        return <OverviewTab subject={subject} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
            <p className="text-gray-600">
              {subject.class?.name}
              {subject.class?.grade && ` - Grade ${subject.class.grade}`}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Quick Action
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}