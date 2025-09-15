import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface DocumentType {
  ID_PROOF: 'id_proof';
  PHOTO: 'photo';
  MARKSHEET: 'marksheet';
  CERTIFICATE: 'certificate';
  RESUME: 'resume';
  EXPERIENCE_LETTER: 'experience_letter';
  QUALIFICATION: 'qualification';
  OTHER: 'other';
}

export interface DocumentResponse {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDocumentRequest {
  type: string;
  description?: string;
}

export interface DocumentStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: Record<string, number>;
}

class DocumentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async uploadDocument(
    file: File,
    type: string,
    description?: string,
    token?: string
  ): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (description) {
      formData.append('description', description);
    }

    const authToken = token || localStorage.getItem('accessToken');
    console.log('Document upload - Token provided:', token ? 'Yes' : 'No');
    console.log('Document upload - Token from localStorage:', localStorage.getItem('accessToken') ? 'Yes' : 'No');
    console.log('Document upload - Using token:', authToken ? authToken.substring(0, 20) + '...' : 'None');
    
    if (!authToken) {
      console.error('No authentication token available for document upload');
      throw new Error('No authentication token available');
    }

    console.log('Uploading document:', { 
      fileName: file.name, 
      fileType: file.type, 
      fileSize: file.size,
      documentType: type,
      apiUrl: `${API_BASE_URL}/documents/upload`
    });

    try {
      // Don't set Content-Type for multipart/form-data - let axios set it with boundary
      const response = await axios.post(
        `${API_BASE_URL}/documents/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            // Remove Content-Type - axios will set it automatically with proper boundary
          },
        }
      );

      console.log('Document uploaded successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Document upload error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data
      });
      throw error;
    }
  }

  async uploadMultipleDocuments(
    files: File[],
    types: string[],
    descriptions?: string[]
  ): Promise<DocumentResponse[]> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    
    formData.append('types', types.join(','));
    if (descriptions && descriptions.length > 0) {
      formData.append('descriptions', descriptions.join(','));
    }

    const response = await axios.post(
      `${API_BASE_URL}/documents/upload-multiple`,
      formData,
      {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  async getMyDocuments(): Promise<DocumentResponse[]> {
    const response = await axios.get(
      `${API_BASE_URL}/documents/my-documents`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    return response.data;
  }

  async getUserDocuments(userId: string): Promise<DocumentResponse[]> {
    const response = await axios.get(
      `${API_BASE_URL}/documents/user/${userId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    return response.data;
  }

  async getDocumentsByStatus(
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    page = 1,
    limit = 10
  ): Promise<{
    documents: DocumentResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await axios.get(
      `${API_BASE_URL}/documents/by-status/${status}`,
      {
        params: { page, limit },
        headers: this.getAuthHeaders(),
      }
    );

    return response.data;
  }

  async getDocumentStatistics(): Promise<DocumentStatistics> {
    const response = await axios.get(
      `${API_BASE_URL}/documents/statistics`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    return response.data;
  }

  async getDocument(documentId: string): Promise<DocumentResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/documents/${documentId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    return response.data;
  }

  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await axios.get(
      `${API_BASE_URL}/documents/download/${documentId}`,
      {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      }
    );

    return response.data;
  }

  async updateDocumentStatus(
    documentId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    reviewNotes?: string
  ): Promise<DocumentResponse> {
    const response = await axios.patch(
      `${API_BASE_URL}/documents/${documentId}/status`,
      {
        status,
        reviewNotes,
      },
      {
        headers: this.getAuthHeaders(),
      }
    );

    return response.data;
  }

  async deleteDocument(documentId: string): Promise<{ message: string }> {
    const response = await axios.delete(
      `${API_BASE_URL}/documents/${documentId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    return response.data;
  }

  getDocumentDownloadUrl(documentId: string): string {
    return `${API_BASE_URL}/documents/download/${documentId}`;
  }

  // Helper method to convert file to UploadedFile format for DocumentUpload component
  convertToUploadedFile(file: File, status: 'pending' | 'uploading' | 'success' | 'error' = 'pending'): any {
    return {
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status,
    };
  }

  // Validate file before upload
  validateFile(
    file: File,
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  ): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    // Check for suspicious file extensions
    const suspiciousExtensions = /\.(exe|bat|cmd|scr|pif|vbs|js)$/i;
    if (suspiciousExtensions.test(file.name)) {
      return {
        isValid: false,
        error: 'File type not allowed for security reasons',
      };
    }

    return { isValid: true };
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new DocumentService();