'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  createdAt: string;
  enrollments: any[];
  documents: any[];
  attendance: number;
  totalFees: number;
  paidFees: number;
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        queryParams.append('status', statusFilter);
      }

      const response = await fetch(
        `http://localhost:3001/api/users/students${queryParams.toString() ? `?${queryParams}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error('Failed to fetch students');
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (studentId: string, newStatus: string) => {
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
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
        return;
      }

      if (response.ok) {
        fetchStudents();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }
      const response = await fetch(`http://localhost:3001/api/users/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchStudents();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'APPROVED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'SUSPENDED': 'bg-red-100 text-red-800',
      'REJECTED': 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'SUSPENDED': return <XCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Students</h1>
          <p className="text-neutral-600 mt-1">Manage all registered students</p>
        </div>
        <Link 
          href="/admin/students/add"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add Student
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Students</p>
              <p className="text-2xl font-bold text-neutral-900">{students.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {students.filter(s => s.status === 'APPROVED').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {students.filter(s => s.status === 'PENDING').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Suspended</p>
              <p className="text-2xl font-bold text-red-600">
                {students.filter(s => s.status === 'SUSPENDED').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2">
            <Filter className="w-5 h-5" />
            More Filters
          </button>
          <button className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-neutral-500">
                    Loading students...
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-neutral-500">
                    No students found
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-medium">
                            {student.firstName[0]}{student.lastName[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-neutral-500">
                            ID: {student.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900 flex items-center gap-1">
                        <Mail className="w-4 h-4 text-neutral-400" />
                        {student.email}
                      </div>
                      <div className="text-sm text-neutral-500 flex items-center gap-1">
                        <Phone className="w-4 h-4 text-neutral-400" />
                        {student.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(student.status)}`}>
                        {getStatusIcon(student.status)}
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        {student.enrollments?.length || 0} Subjects
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-neutral-900">
                          {student.attendance}%
                        </div>
                        <div className="ml-2 w-16 bg-neutral-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${student.attendance >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${student.attendance}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">
                        ₹{student.paidFees.toLocaleString()} / ₹{student.totalFees.toLocaleString()}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {Math.round((student.paidFees / student.totalFees) * 100)}% Paid
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {format(new Date(student.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {/* Handle edit */}}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="relative group">
                          <button className="text-neutral-600 hover:text-neutral-900">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-10 hidden group-hover:block">
                            {student.status === 'PENDING' && (
                              <button
                                onClick={() => handleStatusChange(student.id, 'APPROVED')}
                                className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              >
                                Approve Student
                              </button>
                            )}
                            {student.status === 'APPROVED' && (
                              <button
                                onClick={() => handleStatusChange(student.id, 'SUSPENDED')}
                                className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              >
                                Suspend Student
                              </button>
                            )}
                            {student.status === 'SUSPENDED' && (
                              <button
                                onClick={() => handleStatusChange(student.id, 'APPROVED')}
                                className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                              >
                                Reactivate Student
                              </button>
                            )}
                            {student.status === 'PENDING' && (
                              <button
                                onClick={() => handleStatusChange(student.id, 'REJECTED')}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50"
                              >
                                Reject Application
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-neutral-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-purple-600 text-white'
                      : 'border border-neutral-200 hover:bg-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-neutral-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data for development
const mockStudents: Student[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: '123 Main St, City',
    status: 'APPROVED',
    createdAt: '2024-01-15T10:00:00Z',
    enrollments: [{}, {}, {}],
    documents: [],
    attendance: 85,
    totalFees: 50000,
    paidFees: 35000
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1234567891',
    address: '456 Oak St, City',
    status: 'PENDING',
    createdAt: '2024-01-20T10:00:00Z',
    enrollments: [{}, {}],
    documents: [],
    attendance: 92,
    totalFees: 40000,
    paidFees: 40000
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.j@example.com',
    phone: '+1234567892',
    address: '789 Pine St, City',
    status: 'APPROVED',
    createdAt: '2024-01-10T10:00:00Z',
    enrollments: [{}],
    documents: [],
    attendance: 78,
    totalFees: 30000,
    paidFees: 15000
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.w@example.com',
    phone: '+1234567893',
    address: '321 Elm St, City',
    status: 'SUSPENDED',
    createdAt: '2024-01-05T10:00:00Z',
    enrollments: [{}, {}, {}, {}],
    documents: [],
    attendance: 65,
    totalFees: 60000,
    paidFees: 30000
  },
  {
    id: '5',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.b@example.com',
    phone: '+1234567894',
    address: '654 Maple St, City',
    status: 'PENDING',
    createdAt: '2024-01-25T10:00:00Z',
    enrollments: [{}, {}],
    documents: [],
    attendance: 88,
    totalFees: 45000,
    paidFees: 45000
  }
];