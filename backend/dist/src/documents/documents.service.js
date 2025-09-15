"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const upload_config_1 = require("../config/upload.config");
const fs_1 = require("fs");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async uploadDocument(userId, file, uploadDto, req) {
        if (!(0, upload_config_1.validateFileContent)(file)) {
            if ((0, fs_1.existsSync)(file.path)) {
                (0, fs_1.unlinkSync)(file.path);
            }
            throw new common_1.BadRequestException('Invalid file content or suspicious file detected');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            if ((0, fs_1.existsSync)(file.path)) {
                (0, fs_1.unlinkSync)(file.path);
            }
            throw new common_1.NotFoundException('User not found');
        }
        const fileUrl = (0, upload_config_1.generateFileUrl)(req, file.path);
        const document = await this.prisma.document.create({
            data: {
                userId,
                type: uploadDto.type,
                fileName: file.originalname,
                fileUrl: file.path,
                fileSize: file.size,
                mimeType: file.mimetype,
                status: client_1.DocumentStatus.PENDING,
                ...(uploadDto.description && { reviewNotes: uploadDto.description }),
            },
        });
        return {
            ...document,
            fileUrl,
        };
    }
    async uploadMultipleDocuments(userId, files, documentTypes, descriptions, req) {
        if (files.length !== documentTypes.length) {
            files.forEach(file => {
                if ((0, fs_1.existsSync)(file.path)) {
                    (0, fs_1.unlinkSync)(file.path);
                }
            });
            throw new common_1.BadRequestException('Number of files must match number of document types');
        }
        const uploadedDocuments = [];
        const errors = [];
        for (let i = 0; i < files.length; i++) {
            try {
                const document = await this.uploadDocument(userId, files[i], {
                    type: documentTypes[i],
                    description: descriptions[i],
                }, req);
                uploadedDocuments.push(document);
            }
            catch (error) {
                errors.push(`File ${files[i].originalname}: ${error.message}`);
                for (let j = i; j < files.length; j++) {
                    if ((0, fs_1.existsSync)(files[j].path)) {
                        (0, fs_1.unlinkSync)(files[j].path);
                    }
                }
                break;
            }
        }
        if (errors.length > 0) {
            throw new common_1.BadRequestException(errors.join('; '));
        }
        return uploadedDocuments;
    }
    async getUserDocuments(userId) {
        const documents = await this.prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return documents.map(doc => ({
            ...doc,
            fileUrl: `/api/documents/download/${doc.id}`,
        }));
    }
    async getDocumentById(documentId, userId, userRole) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: { user: true },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (userRole !== client_1.Role.ADMIN && document.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return {
            ...document,
            fileUrl: `/api/documents/download/${document.id}`,
        };
    }
    async downloadDocument(documentId, userId, userRole) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
            include: { user: true },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        if (userRole !== client_1.Role.ADMIN && document.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (!(0, fs_1.existsSync)(document.fileUrl)) {
            throw new common_1.NotFoundException('File not found on server');
        }
        return {
            filePath: document.fileUrl,
            fileName: document.fileName,
        };
    }
    async deleteDocument(documentId, userId, userRole) {
        const document = await this.getDocumentById(documentId, userId, userRole);
        if (userRole !== client_1.Role.ADMIN && document.userId !== userId) {
            throw new common_1.ForbiddenException('Only document owner or admin can delete documents');
        }
        try {
            if ((0, fs_1.existsSync)(document.fileUrl)) {
                (0, fs_1.unlinkSync)(document.fileUrl);
            }
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }
        await this.prisma.document.delete({
            where: { id: documentId },
        });
    }
    async updateDocumentStatus(documentId, updateDto, reviewedBy) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
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
    async getDocumentsByStatus(status, page = 1, limit = 10) {
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
    async getDocumentsByUserId(targetUserId, requestingUserId, userRole) {
        if (userRole !== client_1.Role.ADMIN && targetUserId !== requestingUserId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.getUserDocuments(targetUserId);
    }
    async getDocumentStatistics() {
        const [total, pending, approved, rejected, byType] = await Promise.all([
            this.prisma.document.count(),
            this.prisma.document.count({ where: { status: client_1.DocumentStatus.PENDING } }),
            this.prisma.document.count({ where: { status: client_1.DocumentStatus.APPROVED } }),
            this.prisma.document.count({ where: { status: client_1.DocumentStatus.REJECTED } }),
            this.prisma.document.groupBy({
                by: ['type'],
                _count: true,
            }),
        ]);
        const typeStats = byType.reduce((acc, item) => {
            acc[item.type] = item._count;
            return acc;
        }, {});
        return {
            total,
            pending,
            approved,
            rejected,
            byType: typeStats,
        };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map