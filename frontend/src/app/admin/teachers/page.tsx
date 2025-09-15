'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

export default function TeachersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);

  // Mock data
  const teachers = [
    {
      id: 1,
      name: 'Mr. John Anderson',
      email: 'john.anderson@email.com',
      phone: '+91 98765 43210',
      subjects: ['Mathematics', 'Physics'],
      classes: ['Grade 10', 'Grade 11'],
      experience: '5 years',
      status: 'approved',
      joinDate: '2023-08-15',
      students: 45,
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Ms. Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+91 98765 43211',
      subjects: ['English', 'Literature'],
      classes: ['Grade 9', 'Grade 10'],
      experience: '3 years',
      status: 'approved',
      joinDate: '2023-09-20',
      students: 38,
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Mr. David Lee',
      email: 'david.lee@email.com',
      phone: '+91 98765 43212',
      subjects: ['Chemistry', 'Biology'],
      classes: ['Grade 11', 'Grade 12'],
      experience: '7 years',
      status: 'pending',
      joinDate: '2024-01-05',
      students: 0,
      rating: 0,
    },
    {
      id: 4,
      name: 'Mrs. Emily White',
      email: 'emily.white@email.com',
      phone: '+91 98765 43213',
      subjects: ['History', 'Geography'],
      classes: ['Grade 8', 'Grade 9'],
      experience: '4 years',
      status: 'suspended',
      joinDate: '2023-07-10',
      students: 25,
      rating: 4.5,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
            <AlertCircle className="h-3 w-3" />
            Pending
          </span>
        );
      case 'suspended':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
            <XCircle className="h-3 w-3" />
            Suspended
          </span>
        );
      default:
        return null;
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || teacher.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = () => {
    if (selectedTeachers.length === filteredTeachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(filteredTeachers.map(t => t.id));
    }
  };

  const handleSelectTeacher = (id: number) => {
    setSelectedTeachers(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Teachers Management</h1>
          <p className="text-neutral-600 mt-1">Manage and monitor all teachers</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            href="/admin/teachers/add"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Teacher
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Total Teachers</span>
            <Users className="h-4 w-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{teachers.length}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Active</span>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {teachers.filter(t => t.status === 'approved').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Pending</span>
            <Clock className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {teachers.filter(t => t.status === 'pending').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Avg Rating</span>
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">4.7</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTeachers.length === filteredTeachers.length && filteredTeachers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Subjects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Classes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher.id)}
                      onChange={() => handleSelectTeacher(teacher.id)}
                      className="rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-neutral-900">{teacher.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-neutral-500">
                          <Mail className="h-3 w-3" />
                          {teacher.email}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-neutral-500">
                          <Phone className="h-3 w-3" />
                          {teacher.phone}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes.map((class_, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                        >
                          {class_}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-900">{teacher.students}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(teacher.status)}
                  </td>
                  <td className="px-6 py-4">
                    {teacher.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{teacher.rating}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-neutral-600 hover:text-primary transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-neutral-600 hover:text-primary transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      {teacher.status === 'pending' && (
                        <>
                          <button className="p-1 text-green-600 hover:text-green-700 transition-colors">
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-700 transition-colors">
                            <UserX className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button className="p-1 text-neutral-600 hover:text-neutral-700 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Showing 1 to {filteredTeachers.length} of {teachers.length} results
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1 bg-primary text-white rounded-lg text-sm">1</button>
              <button className="px-3 py-1 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50">
                2
              </button>
              <button className="px-3 py-1 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add missing import
import { Users, Star } from 'lucide-react';