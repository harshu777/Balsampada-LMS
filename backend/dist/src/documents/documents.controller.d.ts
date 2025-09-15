import type { Response, Request } from 'express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto, DocumentResponseDto } from './dto/upload-document.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';
import { Role, DocumentStatus } from '@prisma/client';
interface AuthenticatedUser {
    id: string;
    email: string;
    role: Role;
}
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadDocument(file: Express.Multer.File, uploadDto: UploadDocumentDto, user: AuthenticatedUser, req: Request): Promise<DocumentResponseDto>;
    uploadMultipleDocuments(files: Express.Multer.File[], types: string, descriptions: string, user: AuthenticatedUser, req: Request): Promise<DocumentResponseDto[]>;
    getMyDocuments(user: AuthenticatedUser): Promise<DocumentResponseDto[]>;
    getUserDocuments(userId: string, user: AuthenticatedUser): Promise<DocumentResponseDto[]>;
    getDocumentsByStatus(status: DocumentStatus, page: number, limit: number): Promise<{
        documents: import("@prisma/client").Document[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getDocumentStatistics(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        byType: Record<string, number>;
    }>;
    downloadDocument(documentId: string, user: AuthenticatedUser, res: Response): Promise<void>;
    getDocument(documentId: string, user: AuthenticatedUser): Promise<DocumentResponseDto>;
    updateDocumentStatus(documentId: string, updateDto: UpdateDocumentStatusDto, user: AuthenticatedUser): Promise<DocumentResponseDto>;
    deleteDocument(documentId: string, user: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
export {};
