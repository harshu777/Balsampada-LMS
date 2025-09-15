'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  DocumentTextIcon,
  FolderIcon,
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  DocumentIcon,
  VideoCameraIcon,
  PhotoIcon,
  PaperClipIcon,
  ClockIcon,
  ArrowUpTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Material {
  id: string;
  title: string;
  description?: string;
  type?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  subject: {
    id: string;
    name: string;
    class: {
      id: string;
      name: string;
    };
  };
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  downloadCount: number;
  createdAt: string;
  isActive: boolean;
}

interface Subject {
  id: string;
  name: string;
  class: {
    id: string;
    name: string;
  };
}

interface Folder {
  id: string;
  name: string;
  materialsCount: number;
  lastUpdated: Date;
}

export default function MaterialsPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    type: 'document'
  });

  // Fetch materials and subjects on mount
  useEffect(() => {
    fetchMaterials();
    fetchSubjects();
  }, []);

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/materials', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.materials || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/subjects/my-subjects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Subjects API response:', data);
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile || !formData.title || !formData.subjectId) {
      toast.error('Please fill in all required fields and select a file');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', uploadFile);
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description || '');
    uploadData.append('subjectId', formData.subjectId);
    uploadData.append('type', formData.type);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/materials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      if (response.ok) {
        toast.success('Material uploaded successfully');
        setShowUploadModal(false);
        setUploadFile(null);
        setFormData({
          title: '',
          description: '',
          subjectId: '',
          type: 'document'
        });
        fetchMaterials();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to upload material');
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Failed to upload material');
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/materials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Material deleted successfully');
        fetchMaterials();
      } else {
        toast.error('Failed to delete material');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }
    setUploadFile(file);
    if (!formData.title) {
      setFormData({ ...formData, title: file.name.split('.')[0] });
    }
  };

  // Mock data for folders (if needed)
  useEffect(() => {
    if (materials.length === 0 && !loading) {
      const mockFolders: Folder[] = [
        { id: '1', name: 'Mathematics', materialsCount: 24, lastUpdated: new Date() },
        { id: '2', name: 'Physics', materialsCount: 18, lastUpdated: new Date(Date.now() - 86400000) },
        { id: '3', name: 'Chemistry', materialsCount: 15, lastUpdated: new Date(Date.now() - 172800000) },
      ];
      setFolders(mockFolders);

      // Uncomment to use mock materials
      // const mockMaterials: any[] = [
      //   {
      //     id: '2',
      //     title: 'Newton\'s Laws - Video Lecture',
      //     description: 'Comprehensive video explanation of Newton\'s three laws',
      //     type: 'video',
      //     subject: 'Physics',
      //     className: 'Class 11',
      //     fileSize: '156 MB',
      //     uploadedAt: new Date(Date.now() - 86400000),
      //     downloads: 67,
      //     fileUrl: '/materials/newtons-laws.mp4',
      //     tags: ['physics', 'mechanics', 'newton']
      //   },
      //   {
      //     id: '3',
      //     title: 'Organic Chemistry Notes',
      //     description: 'Complete notes on organic chemistry reactions',
      //     type: 'document',
      //     subject: 'Chemistry',
      //     className: 'Class 12',
      //     fileSize: '4.2 MB',
      //     uploadedAt: new Date(Date.now() - 172800000),
      //     downloads: 89,
      //     fileUrl: '/materials/organic-chemistry.docx',
      //     tags: ['chemistry', 'organic', 'notes']
      //   },
      //   {
      //     id: '4',
      //     title: 'Trigonometry Formulas',
      //     description: 'Quick reference sheet for all trigonometry formulas',
      //     type: 'pdf',
      //     subject: 'Mathematics',
      //     className: 'Class 10',
      //     fileSize: '1.1 MB',
      //     uploadedAt: new Date(Date.now() - 259200000),
      //     downloads: 123,
      //     fileUrl: '/materials/trig-formulas.pdf',
      //     tags: ['mathematics', 'trigonometry', 'formulas']
      //   },
      //   {
      //     id: '5',
      //     title: 'Lab Experiment - Pendulum',
      //     description: 'Step-by-step guide for pendulum experiment',
      //     type: 'presentation',
      //     subject: 'Physics',
      //     className: 'Class 11',
      //     fileSize: '8.7 MB',
      //     uploadedAt: new Date(Date.now() - 345600000),
      //     downloads: 34,
      //     fileUrl: '/materials/pendulum-experiment.pptx',
      //     tags: ['physics', 'lab', 'experiment']
      //   },
      //   {
      //     id: '6',
      //     title: 'Periodic Table Infographic',
      //     description: 'Visual representation of the periodic table',
      //     type: 'image',
      //     subject: 'Chemistry',
      //     className: 'Class 10',
      //     fileSize: '3.8 MB',
      //     uploadedAt: new Date(Date.now() - 432000000),
      //     downloads: 156,
      //     fileUrl: '/materials/periodic-table.png',
      //     tags: ['chemistry', 'periodic-table', 'infographic']
      //   }
      // ];
      
      // setMaterials(mockMaterials);
      setLoading(false);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      console.log('Files dropped:', e.dataTransfer.files);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <DocumentTextIcon className="h-8 w-8 text-red-500" />;
      case 'video':
        return <VideoCameraIcon className="h-8 w-8 text-blue-500" />;
      case 'image':
        return <PhotoIcon className="h-8 w-8 text-green-500" />;
      case 'presentation':
        return <DocumentIcon className="h-8 w-8 text-orange-500" />;
      default:
        return <DocumentIcon className="h-8 w-8 text-neutral-500" />;
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (material.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || material.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Class Materials</h1>
          <p className="text-neutral-600 mt-1">Upload and manage study materials for your students</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <CloudArrowUpIcon className="h-5 w-5" />
          Upload Material
        </button>
      </div>

      {/* Folders Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {folders.map((folder) => (
          <div key={folder.id} className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FolderIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{folder.name}</h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    {folder.materialsCount} materials
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Updated {format(folder.lastUpdated, 'MMM dd')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
            <option value="document">Document</option>
            <option value="presentation">Presentation</option>
          </select>
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('grid')}
              className={`px-3 py-1 rounded ${viewType === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`px-3 py-1 rounded ${viewType === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-neutral-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CloudArrowUpIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-600 mb-2">Drag and drop files here, or click to browse</p>
        <p className="text-sm text-neutral-500">Support for PDF, DOC, PPT, Images, and Videos</p>
        <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Browse Files
        </button>
      </div>

      {/* Materials Grid/List */}
      {viewType === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <DocumentIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-600">No materials found</p>
              <p className="text-sm text-neutral-500 mt-1">Upload your first material to get started</p>
            </div>
          ) : (
            filteredMaterials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  {getFileIcon(material.type || 'document')}
                  <div className="flex gap-1">
                    {material.fileUrl && (
                      <a 
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-neutral-500 hover:text-neutral-700"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </a>
                    )}
                    {material.fileUrl && (
                      <a 
                        href={material.fileUrl}
                        download
                        className="p-1 text-neutral-500 hover:text-neutral-700"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </a>
                    )}
                    <button 
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-neutral-900 mb-1">{material.title}</h3>
                {material.description && (
                  <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{material.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</span>
                  <span>{material.downloadCount || 0} downloads</span>
                </div>
                <div className="mt-2 text-xs text-neutral-500">
                  {material.subject.name} • {material.subject.class.name}
                </div>
                <div className="mt-1 text-xs text-neutral-400">
                  by {material.uploadedBy.firstName} {material.uploadedBy.lastName}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Size</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Downloads</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Uploaded</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                    No materials found
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {getFileIcon(material.type || 'document')}
                        <div>
                          <p className="font-medium text-neutral-900">{material.title}</p>
                          <p className="text-sm text-neutral-500">{material.subject.class.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-sm text-neutral-600">{material.type || 'Document'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{material.subject.name}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{material.downloadCount || 0}</td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {format(new Date(material.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {material.fileUrl && (
                          <>
                            <a
                              href={material.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-neutral-500 hover:text-neutral-700"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </a>
                            <a
                              href={material.fileUrl}
                              download
                              className="p-1 text-neutral-500 hover:text-neutral-700"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </a>
                          </>
                        )}
                        <button 
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <DocumentIcon className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-neutral-600">Total Materials</p>
              <p className="text-2xl font-bold text-neutral-900">{materials.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <ArrowDownTrayIcon className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-neutral-600">Total Downloads</p>
              <p className="text-2xl font-bold text-neutral-900">
                {materials.reduce((sum, m) => sum + m.downloads, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <FolderIcon className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-neutral-600">Folders</p>
              <p className="text-2xl font-bold text-neutral-900">{folders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <CloudArrowUpIcon className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-neutral-600">Storage Used</p>
              <p className="text-2xl font-bold text-neutral-900">2.4 GB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Material Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload Study Material</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setFormData({
                    title: '',
                    description: '',
                    subjectId: '',
                    type: 'document'
                  });
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUploadMaterial} className="space-y-4">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-neutral-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => {
                  handleDrop(e);
                  if (e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
              >
                {uploadFile ? (
                  <div className="space-y-2">
                    <DocumentIcon className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm font-medium text-neutral-900">{uploadFile.name}</p>
                    <p className="text-xs text-neutral-600">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setUploadFile(null)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                    <p className="text-sm text-neutral-600 mb-2">
                      Drag and drop a file here, or click to browse
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.mp4,.mp3,.jpg,.jpeg,.png"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      Choose File
                    </button>
                    <p className="text-xs text-neutral-500 mt-2">
                      Maximum file size: 10MB
                    </p>
                  </>
                )}
              </div>

              {/* Form Fields */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} - {subject.class.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Chapter 5 Notes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Brief description of the material"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Material Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="document">Document</option>
                  <option value="presentation">Presentation</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setFormData({
                      title: '',
                      description: '',
                      subjectId: '',
                      type: 'document'
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || !formData.title || !formData.subjectId}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}