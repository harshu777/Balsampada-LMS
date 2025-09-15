'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, X } from 'lucide-react';

interface DocumentViewerProps {
  documentId: string;
  fileName: string;
  documentType: string;
  status: string;
  onDownload?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  fileName = '',
  documentType,
  status,
  onDownload
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isImage = fileName && fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPDF = fileName && fileName.match(/\.pdf$/i);
  const isPreviewable = isImage || isPDF;

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No authentication token');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/documents/download/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showPreview && !previewUrl) {
      fetchDocument();
    }
  }, [showPreview]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('No authentication token');
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
        
        if (onDownload) {
          onDownload();
        }
      } else {
        alert('Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document');
    }
  };

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-neutral-50">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-neutral-500" />
          <div>
            <p className="font-medium text-neutral-900">
              {documentType.replace(/_/g, ' ').toUpperCase()}
            </p>
            <p className="text-sm text-neutral-500">{fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'APPROVED' 
              ? 'bg-green-100 text-green-800' 
              : status === 'REJECTED'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </span>
          {isPreviewable && (
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="text-blue-600 hover:text-blue-700"
              title={showPreview ? "Hide preview" : "Show preview"}
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={handleDownload}
            className="text-purple-600 hover:text-purple-700"
            title="Download document"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Preview */}
      {showPreview && isPreviewable && (
        <div className="p-4 bg-white">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-neutral-500">Loading preview...</div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500">{error}</div>
            </div>
          )}
          
          {!loading && !error && previewUrl && (
            <>
              {isImage && (
                <img 
                  src={previewUrl}
                  alt={documentType}
                  className="max-w-full h-auto max-h-96 rounded-lg mx-auto"
                />
              )}
              
              {isPDF && (
                <embed
                  src={previewUrl}
                  type="application/pdf"
                  width="100%"
                  height="500px"
                  className="rounded-lg"
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};