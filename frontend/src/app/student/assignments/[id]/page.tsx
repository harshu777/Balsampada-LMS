'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  User,
  BookOpen,
  Download,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Send,
} from 'lucide-react';
import assignmentService, { Assignment } from '@/services/assignment.service';

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock student assignment data - in real app, this would come from the assignment with student submission
  const [studentAssignment, setStudentAssignment] = useState<any>(null);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getAssignment(assignmentId);
      setAssignment(data);
      
      // TODO: Fetch student's submission status from API
      // This would typically be included in the assignment response or fetched separately
      setStudentAssignment({
        submittedAt: null,
        submissionText: '',
        submissionUrl: null,
        marksObtained: null,
        feedback: null,
        gradedAt: null,
      });
    } catch (error) {
      console.error('Failed to fetch assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          file: 'File size must be less than 100MB',
        }));
        return;
      }
      setSubmissionFile(file);
      setErrors(prev => ({
        ...prev,
        file: '',
      }));
    }
  };

  const handleSubmit = async () => {
    if (!submissionText.trim() && !submissionFile) {
      setErrors(prev => ({
        ...prev,
        submit: 'Please provide either text submission or upload a file',
      }));
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      await assignmentService.submitAssignment(
        {
          assignmentId,
          submissionText: submissionText.trim() || undefined,
        },
        submissionFile || undefined
      );

      // Refresh the data
      await fetchAssignmentDetails();
    } catch (error: any) {
      console.error('Failed to submit assignment:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || 'Failed to submit assignment',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const downloadAttachment = async (url: string, filename: string) => {
    try {
      await assignmentService.downloadAttachment(url, filename);
    } catch (error) {
      console.error('Failed to download attachment:', error);
    }
  };

  const isOverdue = assignment && new Date() > new Date(assignment.dueDate);
  const canSubmit = assignment && studentAssignment && !studentAssignment.submittedAt && !isOverdue;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment not found</h3>
        <p className="text-gray-500 mb-4">The assignment you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => router.back()}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
          <p className="text-gray-600">Assignment Details & Submission</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 rounded-lg p-2">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Assignment Details</h2>
            </div>

            <div className="space-y-4">
              {assignment.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
                </div>
              )}

              {assignment.instructions && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Instructions</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-900 whitespace-pre-wrap">{assignment.instructions}</p>
                  </div>
                </div>
              )}

              {assignment.attachmentUrl && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Attachment</h3>
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-900">Assignment File</span>
                    </div>
                    <button
                      onClick={() => downloadAttachment(assignment.attachmentUrl!, 'assignment-file')}
                      className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submission Section */}
          {canSubmit ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Submit Assignment</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Submission
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Type your answer or solution here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Upload
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload your assignment files
                      </p>
                      <p className="text-xs text-gray-500 mb-4">Maximum file size: 100MB</p>
                      <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-block">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip"
                        />
                        Choose File
                      </label>
                    </div>
                  </div>

                  {submissionFile && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{submissionFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(submissionFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSubmissionFile(null);
                          setErrors(prev => ({ ...prev, file: '' }));
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {errors.file && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.file}
                    </p>
                  )}
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-red-700">{errors.submit}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </div>
          ) : studentAssignment?.submittedAt ? (
            /* Submitted Assignment Display */
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 rounded-lg p-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Your Submission</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    ✓ Assignment submitted on {new Date(studentAssignment.submittedAt).toLocaleString()}
                  </p>
                </div>

                {studentAssignment.submissionText && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Text Submission</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{studentAssignment.submissionText}</p>
                    </div>
                  </div>
                )}

                {studentAssignment.submissionUrl && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">File Submission</h3>
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-900">Submitted File</span>
                      </div>
                      <button
                        onClick={() => downloadAttachment(studentAssignment.submissionUrl, 'submission-file')}
                        className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {studentAssignment.gradedAt && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Feedback & Grade</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      {assignment.totalMarks && studentAssignment.marksObtained !== null && (
                        <div className="mb-3">
                          <p className="text-lg font-bold text-blue-900">
                            Grade: {studentAssignment.marksObtained}/{assignment.totalMarks}
                            {' '}({((studentAssignment.marksObtained / assignment.totalMarks) * 100).toFixed(1)}%)
                          </p>
                        </div>
                      )}
                      {studentAssignment.feedback && (
                        <p className="text-blue-800">{studentAssignment.feedback}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Cannot Submit */
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isOverdue ? 'Assignment Overdue' : 'Submission Not Available'}
                </h3>
                <p className="text-gray-500">
                  {isOverdue 
                    ? 'The deadline for this assignment has passed.'
                    : 'You cannot submit this assignment at the moment.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Assignment Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium text-gray-900">{assignment.subject.name}</p>
                  <p className="text-sm text-gray-500">{assignment.subject.class.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Teacher</p>
                  <p className="font-medium text-gray-900">
                    {assignment.teacher.firstName} {assignment.teacher.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {assignmentService.formatDueDate(assignment.dueDate)}
                  </p>
                </div>
              </div>

              {assignment.totalMarks && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Total Marks</p>
                    <p className="font-medium text-gray-900">{assignment.totalMarks}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submission Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Submission Status</h3>
            <div className="space-y-3">
              {studentAssignment?.submittedAt ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 text-sm">Submitted</span>
                  </div>
                  {studentAssignment.gradedAt ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700 text-sm">Graded</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-700 text-sm">Awaiting Grade</span>
                    </div>
                  )}
                </>
              ) : isOverdue ? (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-700 text-sm">Overdue</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-700 text-sm">Pending Submission</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}