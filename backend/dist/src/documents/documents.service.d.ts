import { PrismaService } from '../prisma/prisma.service';
import { Document, DocumentStatus, Role } from '@prisma/client';
import { UploadDocumentDto, DocumentType } from './dto/upload-document.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';
import { Request } from 'express';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    uploadDocument(userId: string, file: Express.Multer.File, uploadDto: UploadDocumentDto, req: Request): Promise<Document>;
    uploadMultipleDocuments(userId: string, files: Express.Multer.File[], documentTypes: DocumentType[], descriptions: string[], req: Request): Promise<Document[]>;
    getUserDocuments(userId: string): Promise<Document[]>;
    getDocumentById(documentId: string, userId: string, userRole: Role): Promise<Document>;
    downloadDocument(documentId: string, userId: string, userRole: Role): Promise<{
        filePath: string;
        fileName: string;
    }>;
    deleteDocument(documentId: string, userId: string, userRole: Role): Promise<void>;
    updateDocumentStatus(documentId: string, updateDto: UpdateDocumentStatusDto, reviewedBy: string): Promise<Document>;
    getDocumentsByStatus(status: DocumentStatus, page?: number, limit?: number): Promise<{
        documents: Document[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getDocumentsByUserId(targetUserId: string, requestingUserId: string, userRole: Role): Promise<Document[]>;
    getDocumentStatistics(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        byType: Record<string, number>;
    }>;
}
