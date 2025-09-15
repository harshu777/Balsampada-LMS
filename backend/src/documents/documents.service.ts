import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Document, DocumentStatus, Role } from '@prisma/client';
import { UploadDocumentDto, DocumentType } from './dto/upload-document.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';
import { validateFileContent, getFileCategory, formatFileSize, generateFileUrl } from '../config/upload.config';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { Request } from 'express';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    uploadDto: UploadDocumentDto,
    req: Request,
  ): Promise<Document> {
    // Validate file content for security
    if (!validateFileContent(file)) {
      // Clean up uploaded file if validation fails
      if (existsSync(file.path)) {
        unlinkSync(file.path);
      }
      throw new BadRequestException('Invalid file content or suspicious file detected');
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Clean up file if user not found
      if (existsSync(file.path)) {
        unlinkSync(file.path);
      }
      throw new NotFoundException('User not found');
    }

    // Generate file URL
    const fileUrl = generateFileUrl(req, file.path);

    // Create document record in database
    const document = await this.prisma.document.create({
      data: {
        userId,
        type: uploadDto.type,
        fileName: file.originalname,
        fileUrl: file.path, // Store local path for file operations
        fileSize: file.size,
        mimeType: file.mimetype,
        status: DocumentStatus.PENDING,
        ...(uploadDto.description && { reviewNotes: uploadDto.description }),
      },
    });

    // Return document with public URL
    return {
      ...document,
      fileUrl,
    };
  }

  async uploadMultipleDocuments(
    userId: string,
    files: Express.Multer.File[],
    documentTypes: DocumentType[],
    descriptions: string[],
    req: Request,
  ): Promise<Document[]> {
    if (files.length !== documentTypes.length) {
      // Clean up all files
      files.forEach(file => {
        if (existsSync(file.path)) {
          unlinkSync(file.path);
        }
      });
      throw new BadRequestException('Number of files must match number of document types');
    }

    const uploadedDocuments: Document[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const document = await this.uploadDocument(
          userId,
          files[i],
          {
            type: documentTypes[i],
            description: descriptions[i],
          },
          req,
        );
        uploadedDocuments.push(document);
      } catch (error) {
        errors.push(`File ${files[i].originalname}: ${error.message}`);
        // Clean up remaining files on error
        for (let j = i; j < files.length; j++) {
          if (existsSync(files[j].path)) {
            unlinkSync(files[j].path);
          }
        }
        break;
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join('; '));
    }

    return uploadedDocuments;
  }

  async getUserDocuments(userId: string): Promise<Document[]> {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Convert local paths to public URLs
    return documents.map(doc => ({
      ...doc,
      fileUrl: `/api/documents/download/${doc.id}`,
    }));
  }

  async getDocumentById(documentId: string, userId: string, userRole: Role): Promise<Document> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check access permissions
    if (userRole !== Role.ADMIN && document.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      ...document,
      fileUrl: `/api/documents/download/${document.id}`,
    };
  }

  async downloadDocument(documentId: string, userId: string, userRole: Role): Promise<{ filePath: string; fileName: string }> {
    // Get the document directly from database without the modified fileUrl
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { user: true },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check access permissions
    if (userRole !== Role.ADMIN && document.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (!existsSync(document.fileUrl)) {
      throw new NotFoundException('File not found on server');
    }

    return {
      filePath: document.fileUrl,
      fileName: document.fileName,
    };
  }

  async deleteDocument(documentId: string, userId: string, userRole: Role): Promise<void> {
    const document = await this.getDocumentById(documentId, userId, userRole);

    // Only allow deletion by the owner or admin
    if (userRole !== Role.ADMIN && document.userId !== userId) {
      throw new ForbiddenException('Only document owner or admin can delete documents');
    }

    // Delete file from filesystem
    try {
      if (existsSync(document.fileUrl)) {
        unlinkSync(document.fileUrl);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete document record from database
    await this.prisma.document.delete({
      where: { id: documentId },
    });
  }

  async updateDocumentStatus(
    documentId: string,
    updateDto: UpdateDocumentStatusDto,
    reviewedBy: string,
  ): Promise<Document> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const updatedDocument = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: updateDto.status,
        reviewedBy,
        reviewNotes: updateDto.reviewNotes || document.reviewNotes,
      },
    });

    return {
      ...updatedDocument,
      fileUrl: `/api/documents/download/${updatedDocument.id}`,
    };
  }

  async getDocumentsByStatus(status: DocumentStatus, page = 1, limit = 10): Promise<{
    documents: Document[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where: { status },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.document.count({ where: { status } }),
    ]);

    const documentsWithUrls = documents.map(doc => ({
      ...doc,
      fileUrl: `/api/documents/download/${doc.id}`,
    }));

    return {
      documents: documentsWithUrls,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDocumentsByUserId(
    targetUserId: string,
    requestingUserId: string,
    userRole: Role,
  ): Promise<Document[]> {
    // Admin can view any user's documents, users can only view their own
    if (userRole !== Role.ADMIN && targetUserId !== requestingUserId) {
      throw new ForbiddenException('Access denied');
    }

    return this.getUserDocuments(targetUserId);
  }

  async getDocumentStatistics(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byType: Record<string, number>;
  }> {
    const [total, pending, approved, rejected, byType] = await Promise.all([
      this.prisma.document.count(),
      this.prisma.document.count({ where: { status: DocumentStatus.PENDING } }),
      this.prisma.document.count({ where: { status: DocumentStatus.APPROVED } }),
      this.prisma.document.count({ where: { status: DocumentStatus.REJECTED } }),
      this.prisma.document.groupBy({
        by: ['type'],
        _count: true,
      }),
    ]);

    const typeStats = byType.reduce((acc, item) => {
      acc[item.type] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      pending,
      approved,
      rejected,
      byType: typeStats,
    };
  }
}