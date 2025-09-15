'use client';

import React, { useState } from 'react';
import { Eye, X, Download, ZoomIn, ZoomOut, RotateCw, FileText, Image } from 'lucide-react';
import { UploadedFile } from './DocumentUpload';

interface DocumentPreviewProps {
  files: UploadedFile[];
  className?: string;
}

interface PreviewModalProps {
  file: UploadedFile;
  isOpen: boolean;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ file, isOpen, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderPreviewContent = () => {
    if (file.preview && file.file.type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full overflow-auto">
          <img
            src={file.preview}
            alt={file.file.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        </div>
      );
    }

    if (file.file.type === 'application/pdf') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-neutral-600">
          <FileText className="h-24 w-24 mb-4 text-neutral-400" />
          <p className="text-lg font-medium mb-2">PDF Document</p>
          <p className="text-sm text-neutral-500 mb-4">{file.file.name}</p>
          <p className="text-xs text-neutral-400 text-center max-w-md">
            PDF preview is not available in this view. You can download the file to view it.
          </p>
        </div>
      );
    }

    // For other file types
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-600">
        <FileText className="h-24 w-24 mb-4 text-neutral-400" />
        <p className="text-lg font-medium mb-2">Document</p>
        <p className="text-sm text-neutral-500 mb-4">{file.file.name}</p>
        <p className="text-xs text-neutral-400 text-center max-w-md">
          Preview is not available for this file type. You can download the file to view it.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {file.file.type.startsWith('image/') ? (
                <Image className="h-5 w-5 text-neutral-500" />
              ) : (
                <FileText className="h-5 w-5 text-neutral-500" />
              )}
              <h3 className="font-medium text-neutral-900 truncate max-w-xs">
                {file.file.name}
              </h3>
            </div>
            <span className="text-sm text-neutral-500">
              ({(file.file.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {file.preview && file.file.type.startsWith('image/') && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-sm text-neutral-600 min-w-[4rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                  title="Rotate"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-neutral-300 mx-1" />
              </>
            )}
            
            <button
              onClick={handleDownload}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-h-0 bg-neutral-50">
          {renderPreviewContent()}
        </div>
        
        {/* Footer */}
        {file.preview && file.file.type.startsWith('image/') && (
          <div className="flex items-center justify-center p-4 border-t bg-neutral-50">
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm text-neutral-600 hover:text-neutral-900"
            >
              Reset View
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ files, className = '' }) => {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  const openPreview = (file: UploadedFile) => {
    setSelectedFile(file);
  };

  const closePreview = () => {
    setSelectedFile(null);
  };

  if (files.length === 0) return null;

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        <h4 className="text-sm font-medium text-neutral-700">Document Preview</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative group cursor-pointer"
              onClick={() => openPreview(file)}
            >
              <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 hover:border-primary transition-colors">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText className="h-12 w-12 text-neutral-400" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              {/* File Info */}
              <div className="mt-2">
                <p className="text-xs font-medium text-neutral-900 truncate">
                  {file.file.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Preview Modal */}
      {selectedFile && (
        <PreviewModal
          file={selectedFile}
          isOpen={true}
          onClose={closePreview}
        />
      )}
    </>
  );
};