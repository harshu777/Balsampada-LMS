'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  User
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { DocumentViewer } from '@/components/documents/DocumentViewer';

interface PendingStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: 'PENDING';
  createdAt: string;
  documents: {
    id: string;
    type: string;
    fileName: string;
    status: string;
  }[];
  requestedSubjects?: string[];
  parentName?: string;
  parentPhone?: string;
}

export default function PendingStudentsPage() {
  const router = useRouter();
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<PendingStudent | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const fetchPendingStudents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/users/students?status=PENDING', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setPendingStudents(data);
      } else {
        console.error('Failed to fetch pending students');
        setPendingStudents([]);
      }
    } catch (error) {
      console.error('Error fetching pending students:', error);
      setPendingStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (documentId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/documents/download/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download document');
        alert('Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document');
    }
  };

  const handleApprove = async (studentId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/users/${studentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'APPROVED' })
      });
      
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
        return;
      }

      if (response.ok) {
        setPendingStudents(prev => prev.filter(s => s.id !== studentId));
        setShowDetails(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Error approving student:', error);
    }
  };

  const handleReject = async (studentId: string, reason?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/users/${studentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'REJECTED', remarks: reason })
      });
      
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
        return;
      }

      if (response.ok) {
        setPendingStudents(prev => prev.filter(s => s.id !== studentId));
        setShowDetails(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Error rejecting student:', error);
    }
  };

  const viewStudentDetails = (student: PendingStudent) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  const filteredStudents = pendingStudents.filter(student => {
    return student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           student.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pending Approvals</h1>
          <p className="text-neutral-600 mt-1">Review and approve student registrations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {pendingStudents.length} Pending
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search pending students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Pending Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-neutral-500">
            Loading pending approvals...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <div className="inline-flex flex-col items-center">
              <div className="p-3 bg-green-100 rounded-full mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-neutral-900 font-medium">All caught up!</p>
              <p className="text-neutral-500 text-sm mt-1">No pending approvals at the moment</p>
            </div>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-medium">
                      {student.firstName[0]}{student.lastName[0]}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-neutral-900">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Applied {format(new Date(student.createdAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-neutral-600">
                  <Mail className="w-4 h-4 mr-2 text-neutral-400" />
                  {student.email}
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <Phone className="w-4 h-4 mr-2 text-neutral-400" />
                  {student.phone}
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
                  {student.address}
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-3 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Documents</span>
                  <span className={`font-medium ${
                    student.documents.length >= 3 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {student.documents.length} Uploaded
                  </span>
                </div>
                {student.requestedSubjects && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-neutral-600">Subjects</span>
                    <span className="font-medium text-neutral-900">
                      {student.requestedSubjects.length} Selected
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => viewStudentDetails(student)}
                  className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => handleApprove(student.id)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReject(student.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Student Details Modal */}
      {showDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900">Student Application Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-600">Full Name</label>
                    <p className="font-medium text-neutral-900">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Email</label>
                    <p className="font-medium text-neutral-900">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Phone</label>
                    <p className="font-medium text-neutral-900">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Address</label>
                    <p className="font-medium text-neutral-900">{selectedStudent.address}</p>
                  </div>
                  {selectedStudent.parentName && (
                    <div>
                      <label className="text-sm text-neutral-600">Parent/Guardian</label>
                      <p className="font-medium text-neutral-900">{selectedStudent.parentName}</p>
                    </div>
                  )}
                  {selectedStudent.parentPhone && (
                    <div>
                      <label className="text-sm text-neutral-600">Parent Contact</label>
                      <p className="font-medium text-neutral-900">{selectedStudent.parentPhone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Uploaded Documents
                </h3>
                <div className="space-y-3">
                  {selectedStudent.documents.map((doc) => (
                    <DocumentViewer
                      key={doc.id}
                      documentId={doc.id}
                      fileName={doc.fileName}
                      documentType={doc.type}
                      status={doc.status}
                    />
                  ))}
                </div>
              </div>

              {/* Requested Subjects */}
              {selectedStudent.requestedSubjects && (
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Requested Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.requestedSubjects.map((subject, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => handleApprove(selectedStudent.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Application
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason (optional):');
                    handleReject(selectedStudent.id, reason || undefined);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock data for development
const mockPendingStudents: PendingStudent[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.j@example.com',
    phone: '+1234567890',
    address: '123 Student St, City',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    documents: [
      { id: '1', type: 'ID Proof', fileName: 'aadhar.pdf', status: 'VERIFIED' },
      { id: '2', type: 'Photo', fileName: 'photo.jpg', status: 'VERIFIED' },
      { id: '3', type: 'Marksheet', fileName: '10th_marksheet.pdf', status: 'PENDING' }
    ],
    requestedSubjects: ['Mathematics', 'Physics', 'Chemistry'],
    parentName: 'Robert Johnson',
    parentPhone: '+1234567899'
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@example.com',
    phone: '+1234567891',
    address: '456 College Ave, City',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    documents: [
      { id: '4', type: 'ID Proof', fileName: 'passport.pdf', status: 'VERIFIED' },
      { id: '5', type: 'Photo', fileName: 'profile.jpg', status: 'VERIFIED' }
    ],
    requestedSubjects: ['English', 'History'],
    parentName: 'Mary Smith',
    parentPhone: '+1234567898'
  },
  {
    id: '3',
    firstName: 'Carol',
    lastName: 'Williams',
    email: 'carol.w@example.com',
    phone: '+1234567892',
    address: '789 School Rd, City',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    documents: [
      { id: '6', type: 'ID Proof', fileName: 'driving_license.pdf', status: 'VERIFIED' },
      { id: '7', type: 'Photo', fileName: 'student_photo.jpg', status: 'VERIFIED' },
      { id: '8', type: 'Marksheet', fileName: '12th_marksheet.pdf', status: 'VERIFIED' },
      { id: '9', type: 'Certificate', fileName: 'sports_certificate.pdf', status: 'PENDING' }
    ],
    requestedSubjects: ['Biology', 'Chemistry', 'Physics', 'Mathematics'],
    parentName: 'James Williams',
    parentPhone: '+1234567897'
  }
];