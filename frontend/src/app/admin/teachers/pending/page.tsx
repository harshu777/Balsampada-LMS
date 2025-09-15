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
  User,
  GraduationCap,
  Briefcase,
  Award,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { DocumentViewer } from '@/components/documents/DocumentViewer';

interface PendingTeacher {
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
  qualifications?: string[];
  subjects?: string[];
  experience?: string;
  bio?: string;
}

export default function PendingTeachersPage() {
  const router = useRouter();
  const [pendingTeachers, setPendingTeachers] = useState<PendingTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<PendingTeacher | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const fetchPendingTeachers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:3001/api/users/teachers?status=PENDING', {
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
        setPendingTeachers(data);
      } else {
        console.error('Failed to fetch pending teachers');
        setPendingTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching pending teachers:', error);
      setPendingTeachers([]);
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

  const handleApprove = async (teacherId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/users/${teacherId}/status`, {
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
        setPendingTeachers(prev => prev.filter(t => t.id !== teacherId));
        setShowDetails(false);
        setSelectedTeacher(null);
      }
    } catch (error) {
      console.error('Error approving teacher:', error);
    }
  };

  const handleReject = async (teacherId: string, reason?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/users/${teacherId}/status`, {
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
        setPendingTeachers(prev => prev.filter(t => t.id !== teacherId));
        setShowDetails(false);
        setSelectedTeacher(null);
      }
    } catch (error) {
      console.error('Error rejecting teacher:', error);
    }
  };

  const viewTeacherDetails = (teacher: PendingTeacher) => {
    setSelectedTeacher(teacher);
    setShowDetails(true);
  };

  const filteredTeachers = pendingTeachers.filter(teacher => {
    return teacher.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           teacher.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pending Teacher Approvals</h1>
          <p className="text-neutral-600 mt-1">Review and approve teacher registrations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {pendingTeachers.length} Pending
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search pending teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Pending Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-neutral-500">
            Loading pending approvals...
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <div className="inline-flex flex-col items-center">
              <div className="p-3 bg-green-100 rounded-full mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-neutral-900 font-medium">All caught up!</p>
              <p className="text-neutral-500 text-sm mt-1">No pending teacher approvals at the moment</p>
            </div>
          </div>
        ) : (
          filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-neutral-900">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Applied {format(new Date(teacher.createdAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-neutral-600">
                  <Mail className="w-4 h-4 mr-2 text-neutral-400" />
                  {teacher.email}
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <Phone className="w-4 h-4 mr-2 text-neutral-400" />
                  {teacher.phone}
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
                  {teacher.address}
                </div>
                {teacher.experience && (
                  <div className="flex items-center text-sm text-neutral-600">
                    <Briefcase className="w-4 h-4 mr-2 text-neutral-400" />
                    {teacher.experience} experience
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-200 pt-3 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Documents</span>
                  <span className={`font-medium ${
                    teacher.documents.length >= 3 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {teacher.documents.length} Uploaded
                  </span>
                </div>
                {teacher.subjects && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-neutral-600">Subjects</span>
                    <span className="font-medium text-neutral-900">
                      {teacher.subjects.length} Specializations
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => viewTeacherDetails(teacher)}
                  className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => handleApprove(teacher.id)}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleReject(teacher.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Teacher Details Modal */}
      {showDetails && selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900">Teacher Application Details</h2>
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
                      {selectedTeacher.firstName} {selectedTeacher.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Email</label>
                    <p className="font-medium text-neutral-900">{selectedTeacher.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Phone</label>
                    <p className="font-medium text-neutral-900">{selectedTeacher.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Address</label>
                    <p className="font-medium text-neutral-900">{selectedTeacher.address}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Information
                </h3>
                <div className="space-y-3">
                  {selectedTeacher.experience && (
                    <div>
                      <label className="text-sm text-neutral-600">Teaching Experience</label>
                      <p className="font-medium text-neutral-900">{selectedTeacher.experience}</p>
                    </div>
                  )}
                  {selectedTeacher.bio && (
                    <div>
                      <label className="text-sm text-neutral-600">Bio</label>
                      <p className="font-medium text-neutral-900">{selectedTeacher.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Qualifications */}
              {selectedTeacher.qualifications && (
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Qualifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.qualifications.map((qual, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects */}
              {selectedTeacher.subjects && (
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Subject Specializations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.subjects.map((subject, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Uploaded Documents
                </h3>
                <div className="space-y-3">
                  {selectedTeacher.documents.map((doc) => (
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => handleApprove(selectedTeacher.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Application
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Rejection reason (optional):');
                    handleReject(selectedTeacher.id, reason || undefined);
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
const mockPendingTeachers: PendingTeacher[] = [
  {
    id: '1',
    firstName: 'Dr. Sarah',
    lastName: 'Anderson',
    email: 'sarah.anderson@example.com',
    phone: '+1234567890',
    address: '123 University Ave, City',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    documents: [
      { id: '1', type: 'ID Proof', fileName: 'aadhar.pdf', status: 'VERIFIED' },
      { id: '2', type: 'Photo', fileName: 'photo.jpg', status: 'VERIFIED' },
      { id: '3', type: 'Degree Certificate', fileName: 'phd_certificate.pdf', status: 'VERIFIED' },
      { id: '4', type: 'Experience Certificate', fileName: 'experience.pdf', status: 'PENDING' }
    ],
    qualifications: ['PhD in Mathematics', 'M.Sc Mathematics', 'B.Sc Mathematics'],
    subjects: ['Advanced Mathematics', 'Calculus', 'Linear Algebra', 'Statistics'],
    experience: '10+ years',
    bio: 'Passionate educator with a decade of experience in teaching mathematics at various levels.'
  },
  {
    id: '2',
    firstName: 'Prof. John',
    lastName: 'Miller',
    email: 'john.miller@example.com',
    phone: '+1234567891',
    address: '456 Academic Blvd, City',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    documents: [
      { id: '5', type: 'ID Proof', fileName: 'passport.pdf', status: 'VERIFIED' },
      { id: '6', type: 'Photo', fileName: 'profile.jpg', status: 'VERIFIED' },
      { id: '7', type: 'Degree Certificate', fileName: 'masters_certificate.pdf', status: 'VERIFIED' }
    ],
    qualifications: ['M.Tech Computer Science', 'B.Tech Computer Science'],
    subjects: ['Computer Science', 'Programming', 'Data Structures', 'Algorithms'],
    experience: '5+ years',
    bio: 'Expert in computer science with industry experience in software development.'
  },
  {
    id: '3',
    firstName: 'Ms. Emily',
    lastName: 'Brown',
    email: 'emily.brown@example.com',
    phone: '+1234567892',
    address: '789 School St, City',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    documents: [
      { id: '8', type: 'ID Proof', fileName: 'driving_license.pdf', status: 'VERIFIED' },
      { id: '9', type: 'Photo', fileName: 'teacher_photo.jpg', status: 'VERIFIED' },
      { id: '10', type: 'Degree Certificate', fileName: 'ba_english.pdf', status: 'VERIFIED' },
      { id: '11', type: 'Teaching Certificate', fileName: 'teaching_cert.pdf', status: 'VERIFIED' }
    ],
    qualifications: ['MA English Literature', 'BA English', 'B.Ed'],
    subjects: ['English', 'Literature', 'Creative Writing', 'Grammar'],
    experience: '7+ years',
    bio: 'Dedicated English teacher with a passion for literature and creative writing.'
  }
];