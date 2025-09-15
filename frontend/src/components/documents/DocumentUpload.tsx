'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle, Image, FileText } from 'lucide-react';
import { DocumentPreview } from './DocumentPreview';

export interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface DocumentUploadProps {
  label: string;
  description?: string;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  required?: boolean;
  allowedTypes?: string[];
  onFilesChange?: (files: UploadedFile[]) => void;
  onUpload?: (files: UploadedFile[]) => Promise<void>;
  className?: string;
  error?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const DEFAULT_ACCEPTED_TYPES = 'image/*,.pdf,.doc,.docx';
const DEFAULT_MAX_SIZE = 5; // 5MB
const DEFAULT_MAX_FILES = 1;

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  description,
  accept = DEFAULT_ACCEPTED_TYPES,
  maxSize = DEFAULT_MAX_SIZE,
  maxFiles = DEFAULT_MAX_FILES,
  required = false,
  allowedTypes = ['PDF', 'JPG', 'PNG', 'DOC', 'DOCX'],
  onFilesChange,
  onUpload,
  className = '',
  error,
  disabled = false,
  showPreview = true,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidType = Object.values(ACCEPTED_FILE_TYPES)
      .flat()
      .some(ext => ext.substring(1) === fileExtension);

    if (!isValidType) {
      return `File type must be one of: ${allowedTypes.join(', ')}`;
    }

    return null;
  }, [maxSize, allowedTypes]);

  const createFilePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  const processFiles = useCallback(async (newFiles: FileList | File[]): Promise<UploadedFile[]> => {
    const fileArray = Array.from(newFiles);
    const processedFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      const preview = await createFilePreview(file);

      processedFiles.push({
        file,
        id: generateFileId(),
        preview,
        status: validationError ? 'error' : 'pending',
        error: validationError || undefined,
      });
    }

    return processedFiles;
  }, [validateFile, createFilePreview]);

  const handleFileSelect = useCallback(async (newFiles: FileList | File[]) => {
    if (disabled || newFiles.length === 0) return;

    const currentFileCount = files.length;
    const newFileCount = newFiles.length;

    if (currentFileCount + newFileCount > maxFiles) {
      alert(`Maximum ${maxFiles} file(s) allowed`);
      return;
    }

    const processedFiles = await processFiles(newFiles);
    const updatedFiles = [...files, ...processedFiles];

    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, maxFiles, disabled, processFiles, onFilesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!disabled) {
      const droppedFiles = e.dataTransfer.files;
      handleFileSelect(droppedFiles);
    }
  }, [disabled, handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      handleFileSelect(selectedFiles);
    }
  }, [handleFileSelect]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, onFilesChange]);

  const handleUpload = useCallback(async () => {
    if (!onUpload || files.length === 0) return;

    setIsUploading(true);
    
    // Update file statuses to uploading
    const uploadingFiles = files.map(f => ({ ...f, status: 'uploading' as const }));
    setFiles(uploadingFiles);
    onFilesChange?.(uploadingFiles);

    try {
      await onUpload(uploadingFiles);
      
      // Update status to success
      const successFiles = uploadingFiles.map(f => ({ ...f, status: 'success' as const }));
      setFiles(successFiles);
      onFilesChange?.(successFiles);
    } catch (error) {
      // Update status to error
      const errorFiles = uploadingFiles.map(f => ({ 
        ...f, 
        status: 'error' as const, 
        error: 'Upload failed. Please try again.' 
      }));
      setFiles(errorFiles);
      onFilesChange?.(errorFiles);
    } finally {
      setIsUploading(false);
    }
  }, [files, onUpload, onFilesChange]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type === 'application/pdf') return FileText;
    return File;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {description && (
          <p className="text-sm text-neutral-600 mb-3">{description}</p>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-neutral-300'}
          ${error ? 'border-red-500 bg-red-50' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-neutral-700">
            Drop files here or <span className="text-primary">browse</span>
          </p>
          <p className="text-sm text-neutral-500">
            Supports: {allowedTypes.join(', ')} (max {maxSize}MB each)
          </p>
          {maxFiles > 1 && (
            <p className="text-xs text-neutral-400">
              Maximum {maxFiles} files allowed
            </p>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-neutral-700">
              Selected Files ({files.length}/{maxFiles})
            </h4>
            {onUpload && files.some(f => f.status === 'pending') && (
              <button
                onClick={handleUpload}
                disabled={isUploading || disabled}
                className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((uploadedFile) => {
              const IconComponent = getFileIcon(uploadedFile.file);
              
              return (
                <div
                  key={uploadedFile.id}
                  className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                >
                  <IconComponent className="h-5 w-5 text-neutral-500 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Indicator */}
                    {uploadedFile.status === 'pending' && (
                      <div className="h-2 w-2 bg-neutral-400 rounded-full" />
                    )}
                    {uploadedFile.status === 'uploading' && (
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {uploadedFile.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {uploadedFile.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(uploadedFile.id)}
                      disabled={uploadedFile.status === 'uploading' || disabled}
                      className="p-1 text-neutral-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Error Messages */}
          {files.some(f => f.error) && (
            <div className="space-y-1">
              {files
                .filter(f => f.error)
                .map(f => (
                  <div key={f.id} className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{f.file.name}: {f.error}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Preview Section */}
      {showPreview && files.length > 0 && files.some(f => f.preview) && (
        <DocumentPreview files={files.filter(f => f.preview)} />
      )}
    </div>
  );
};