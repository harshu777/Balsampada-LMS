import { diskStorage } from 'multer';
import { Request } from 'express';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface FileUploadConfig {
  destination: string;
  filename: string;
  limits: {
    fileSize: number;
    files: number;
  };
  fileFilter: (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
}

// Allowed file types with their MIME types and extensions
export const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  DEFAULT: 5 * 1024 * 1024, // 5MB
  IMAGE: 2 * 1024 * 1024,   // 2MB for images
  DOCUMENT: 10 * 1024 * 1024, // 10MB for documents
};

// Upload directories
export const UPLOAD_PATHS = {
  DOCUMENTS: 'uploads/documents',
  PROFILES: 'uploads/profiles',
  MATERIALS: 'uploads/materials',
  ASSIGNMENTS: 'uploads/assignments',
};

/**
 * Create upload directory if it doesn't exist
 */
function ensureUploadDir(uploadPath: string): void {
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }
}

/**
 * Generate unique filename with timestamp and random string
 */
function generateFilename(originalname: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const fileExtension = extname(originalname).toLowerCase();
  const baseName = originalname.replace(fileExtension, '').replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${timestamp}_${randomString}_${baseName}${fileExtension}`;
}

/**
 * File filter function to validate file types
 */
function createFileFilter(allowedTypes?: string[]): (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => void {
  return (req: Request, file: Express.Multer.File, callback) => {
    const allowedMimeTypes = allowedTypes || Object.keys(ALLOWED_FILE_TYPES);
    const fileExtension = extname(file.originalname).toLowerCase();
    
    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`),
        false
      );
    }
    
    // Check file extension
    const allowedExtensions = ALLOWED_FILE_TYPES[file.mimetype as keyof typeof ALLOWED_FILE_TYPES];
    if (!allowedExtensions?.includes(fileExtension)) {
      return callback(
        new BadRequestException(`File extension ${fileExtension} is not allowed for MIME type ${file.mimetype}`),
        false
      );
    }
    
    callback(null, true);
  };
}

/**
 * Create multer storage configuration for documents
 */
export function createDocumentStorage(subPath = ''): any {
  const uploadPath = join(process.cwd(), UPLOAD_PATHS.DOCUMENTS, subPath);
  ensureUploadDir(uploadPath);
  
  return diskStorage({
    destination: (req, file, callback) => {
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      const filename = generateFilename(file.originalname);
      callback(null, filename);
    },
  });
}

/**
 * Create multer storage configuration for profile images
 */
export function createProfileStorage(): any {
  const uploadPath = join(process.cwd(), UPLOAD_PATHS.PROFILES);
  ensureUploadDir(uploadPath);
  
  return diskStorage({
    destination: (req, file, callback) => {
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      const filename = generateFilename(file.originalname);
      callback(null, filename);
    },
  });
}

/**
 * Document upload configuration
 */
export const documentUploadConfig = {
  storage: createDocumentStorage(),
  limits: {
    fileSize: FILE_SIZE_LIMITS.DEFAULT,
    files: 5, // Maximum 5 files per request
  },
  fileFilter: createFileFilter(),
};

/**
 * Profile image upload configuration
 */
export const profileUploadConfig = {
  storage: createProfileStorage(),
  limits: {
    fileSize: FILE_SIZE_LIMITS.IMAGE,
    files: 1, // Only one profile image
  },
  fileFilter: createFileFilter(['image/jpeg', 'image/png']),
};

/**
 * Validation function to check file security
 */
export function validateFileContent(file: Express.Multer.File): boolean {
  // Additional security checks can be added here
  // For example, checking file headers, scanning for malicious content, etc.
  
  // Basic validation: check if file size is reasonable
  if (file.size === 0) {
    return false;
  }
  
  // Check if filename contains suspicious patterns
  const suspiciousPatterns = /\.(exe|bat|cmd|scr|pif|vbs|js)$/i;
  if (suspiciousPatterns.test(file.originalname)) {
    return false;
  }
  
  return true;
}

/**
 * Get file type category based on MIME type
 */
export function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  return 'other';
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate secure file URL
 */
export function generateFileUrl(req: Request, filePath: string): string {
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;
  
  // Remove the base path and create relative URL
  const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
  
  return `${baseUrl}${relativePath}`;
}