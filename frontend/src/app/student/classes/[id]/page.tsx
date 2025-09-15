'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ArrowLeftIcon,
  UsersIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentTextIcon
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
    { id: 'materials', name: 'Materials', icon: BookOpenIcon },
    { id: 'assignments', name: 'Assignments', icon: ClipboardDocumentListIcon },
    { id: 'tests', name: 'Tests', icon: AcademicCapIcon },
    { id: 'teachers', name: 'Teachers', icon: UsersIcon },
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

function OverviewTab({ subject, enrollment }: { subject: Subject; enrollment: StudentEnrollment | null }) {
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
            <dt className="text-sm font-medium text-gray-500">Enrollment Status</dt>
            <dd className="mt-1">
              {enrollment ? (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  enrollment.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {enrollment.isActive ? 'Active' : 'Inactive'}
                </span>
              ) : (
                <span className="text-gray-500">Not enrolled</span>
              )}
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

      {/* Enrollment Details */}
      {enrollment && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Enrollment Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {EnrollmentService.formatEnrollmentDate(enrollment.enrollmentDate)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {EnrollmentService.getEnrollmentDuration(enrollment)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
              <dd className="mt-1">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  EnrollmentService.getPaymentStatusColor(enrollment.paymentStatus)
                }`}>
                  {enrollment.paymentStatus === 'APPROVED' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                  {enrollment.paymentStatus === 'PENDING' && <ClockIcon className="h-3 w-3 mr-1" />}
                  {enrollment.paymentStatus === 'REJECTED' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                  {EnrollmentService.formatPaymentStatus(enrollment.paymentStatus)}
                </span>
              </dd>
            </div>
            {enrollment.payments && enrollment.payments.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Payment</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(enrollment.payments[0].paymentDate).toLocaleDateString()} - 
                  ${enrollment.payments[0].amount}
                </dd>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Teachers</p>
              <p className="text-2xl font-bold text-gray-900">
                {subject._count?.teachers || 0}
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

function MaterialsTab({ subject }: { subject: Subject }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Study Materials</h3>
      </div>
      
      {subject.materials && subject.materials.length > 0 ? (
        <div className="space-y-4">
          {subject.materials.map((material) => (
            <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    <h4 className="text-sm font-medium text-gray-900">{material.title}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {material.type}
                    </span>
                  </div>
                  {material.description && (
                    <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Added: {new Date(material.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {material.fileUrl ? (
                    <>
                      <button
                        onClick={() => window.open(material.fileUrl, '_blank')}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = material.fileUrl!;
                          link.download = material.title;
                          link.click();
                        }}
                        className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </>
                  ) : material.content ? (
                    <button
                      onClick={() => {
                        // Show content in modal or new page
                        alert('Content view feature to be implemented');
                      }}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Read
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No materials available</h3>
          <p className="text-sm text-gray-500">Materials will appear here once your teacher uploads them.</p>
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
      </div>
      
      {subject.assignments && subject.assignments.length > 0 ? (
        <div className="space-y-4">
          {subject.assignments.map((assignment) => {
            const isOverdue = new Date(assignment.dueDate) < new Date();
            const isDueSoon = new Date(assignment.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            
            return (
              <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <ClipboardDocumentListIcon className="h-5 w-5 text-yellow-600" />
                      <h4 className="text-sm font-medium text-gray-900">{assignment.title}</h4>
                      {isOverdue && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Overdue
                        </span>
                      )}
                      {!isOverdue && isDueSoon && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Due Soon
                        </span>
                      )}
                    </div>
                    {assignment.description && (
                      <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className={isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : ''}>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      <span>Assigned by: {assignment.teacher.firstName} {assignment.teacher.lastName}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => window.open(`/student/assignments/${assignment.id}`, '_blank')}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                    {!isOverdue && (
                      <button
                        onClick={() => window.open(`/student/assignments/${assignment.id}/submit`, '_blank')}
                        className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No assignments yet</h3>
          <p className="text-sm text-gray-500">Assignments will appear here once your teacher creates them.</p>
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
      </div>
      
      {subject.tests && subject.tests.length > 0 ? (
        <div className="space-y-4">
          {subject.tests.map((test) => {
            const now = new Date();
            const startTime = new Date(test.startTime);
            const endTime = new Date(test.endTime);
            const isUpcoming = startTime > now;
            const isActive = startTime <= now && now <= endTime;
            const isCompleted = endTime < now;
            
            return (
              <div key={test.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <AcademicCapIcon className="h-5 w-5 text-purple-600" />
                      <h4 className="text-sm font-medium text-gray-900">{test.title}</h4>
                      {isUpcoming && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Upcoming
                        </span>
                      )}
                      {isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    {test.description && (
                      <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Start: {startTime.toLocaleString()}</span>
                      <span>End: {endTime.toLocaleString()}</span>
                      <span>By: {test.teacher.firstName} {test.teacher.lastName}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => window.open(`/student/tests/${test.id}`, '_blank')}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                    {isActive && (
                      <button
                        onClick={() => window.open(`/student/tests/${test.id}/take`, '_blank')}
                        className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Take Test
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No tests scheduled</h3>
          <p className="text-sm text-gray-500">Tests will appear here once your teacher schedules them.</p>
        </div>
      )}
    </div>
  );
}

function TeachersTab({ subject }: { subject: Subject }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Teachers</h3>
      </div>
      
      {subject.teachers && subject.teachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subject.teachers.map((ts) => (
            <div key={ts.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">
                    {ts.teacher.firstName[0]}{ts.teacher.lastName[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {ts.teacher.firstName} {ts.teacher.lastName}
                  </h4>
                  <p className="text-sm text-gray-500">{ts.teacher.email}</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                    Subject Teacher
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900">No teachers assigned</h3>
          <p className="text-sm text-gray-500">Teachers will be listed here once assigned to this subject.</p>
        </div>
      )}
    </div>
  );
}

export default function StudentClassDetailPage() {
  const params = useParams();
  const subjectId = params?.id as string;
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [enrollment, setEnrollment] = useState<StudentEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!subjectId) return;

    const loadSubjectAndEnrollment = async () => {
      try {
        setLoading(true);
        const [subjectData, enrollmentsResponse] = await Promise.all([
          SubjectService.getSubject(subjectId),
          EnrollmentService.getMyEnrollments({ limit: 100 })
        ]);
        
        setSubject(subjectData);
        
        // Find enrollment for this subject
        const myEnrollment = enrollmentsResponse.enrollments?.find(
          e => e.subject.id === subjectId
        );
        setEnrollment(myEnrollment || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load class details');
      } finally {
        setLoading(false);
      }
    };

    loadSubjectAndEnrollment();
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
          <p className="text-red-600">{error || 'Class not found'}</p>
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
        return <OverviewTab subject={subject} enrollment={enrollment} />;
      case 'materials':
        return <MaterialsTab subject={subject} />;
      case 'assignments':
        return <AssignmentsTab subject={subject} />;
      case 'tests':
        return <TestsTab subject={subject} />;
      case 'teachers':
        return <TeachersTab subject={subject} />;
      default:
        return <OverviewTab subject={subject} enrollment={enrollment} />;
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
        
        <div className="flex items-center space-x-3">
          {enrollment && enrollment.paymentStatus === 'PENDING' && (
            <button
              onClick={() => window.open(`/student/payments?enrollment=${enrollment.id}`, '_blank')}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
              Complete Payment
            </button>
          )}
          {enrollment && enrollment.isActive && (
            <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Enrolled
            </div>
          )}
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