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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const documents_service_1 = require("./documents.service");
const upload_document_dto_1 = require("./dto/upload-document.dto");
const update_document_status_dto_1 = require("./dto/update-document-status.dto");
const upload_config_1 = require("../config/upload.config");
const client_1 = require("@prisma/client");
const fs_1 = require("fs");
let DocumentsController = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async uploadDocument(file, uploadDto, user, req) {
        if (!file) {
            throw new Error('No file provided');
        }
        const document = await this.documentsService.uploadDocument(user.id, file, uploadDto, req);
        return {
            id: document.id,
            type: document.type,
            fileName: document.fileName,
            fileUrl: document.fileUrl,
            fileSize: document.fileSize || 0,
            mimeType: document.mimeType || '',
            status: document.status,
            description: document.reviewNotes || undefined,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
    async uploadMultipleDocuments(files, types, descriptions, user, req) {
        if (!files || files.length === 0) {
            throw new Error('No files provided');
        }
        const documentTypes = types.split(',').map(type => type.trim());
        const documentDescriptions = descriptions ? descriptions.split(',').map(desc => desc.trim()) : [];
        const documents = await this.documentsService.uploadMultipleDocuments(user.id, files, documentTypes, documentDescriptions, req);
        return documents.map(document => ({
            id: document.id,
            type: document.type,
            fileName: document.fileName,
            fileUrl: document.fileUrl,
            fileSize: document.fileSize || 0,
            mimeType: document.mimeType || '',
            status: document.status,
            description: document.reviewNotes || undefined,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        }));
    }
    async getMyDocuments(user) {
        const documents = await this.documentsService.getUserDocuments(user.id);
        return documents.map(document => ({
            id: document.id,
            type: document.type,
            fileName: document.fileName,
            fileUrl: document.fileUrl,
            fileSize: document.fileSize || 0,
            mimeType: document.mimeType || '',
            status: document.status,
            description: document.reviewNotes || undefined,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        }));
    }
    async getUserDocuments(userId, user) {
        const documents = await this.documentsService.getDocumentsByUserId(userId, user.id, user.role);
        return documents.map(document => ({
            id: document.id,
            type: document.type,
            fileName: document.fileName,
            fileUrl: document.fileUrl,
            fileSize: document.fileSize || 0,
            mimeType: document.mimeType || '',
            status: document.status,
            description: document.reviewNotes || undefined,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        }));
    }
    async getDocumentsByStatus(status, page, limit) {
        return this.documentsService.getDocumentsByStatus(status, page, limit);
    }
    async getDocumentStatistics() {
        return this.documentsService.getDocumentStatistics();
    }
    async downloadDocument(documentId, user, res) {
        const { filePath, fileName } = await this.documentsService.downloadDocument(documentId, user.id, user.role);
        if (!(0, fs_1.existsSync)(filePath)) {
            res.status(404).json({ message: 'File not found' });
            return;
        }
        const fileStream = (0, fs_1.createReadStream)(filePath);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        fileStream.pipe(res);
    }
    async getDocument(documentId, user) {
        const document = await this.documentsService.getDocumentById(documentId, user.id, user.role);
        return {
            id: document.id,
            type: document.type,
            fileName: document.fileName,
            fileUrl: document.fileUrl,
            fileSize: document.fileSize || 0,
            mimeType: document.mimeType || '',
            status: document.status,
            description: document.reviewNotes || undefined,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
    async updateDocumentStatus(documentId, updateDto, user) {
        const document = await this.documentsService.updateDocumentStatus(documentId, updateDto, user.id);
        return {
            id: document.id,
            type: document.type,
            fileName: document.fileName,
            fileUrl: document.fileUrl,
            fileSize: document.fileSize || 0,
            mimeType: document.mimeType || '',
            status: document.status,
            description: document.reviewNotes || undefined,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
    async deleteDocument(documentId, user) {
        await this.documentsService.deleteDocument(documentId, user.id, user.role);
        return { message: 'Document deleted successfully' };
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a single document' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Document uploaded successfully',
        type: upload_document_dto_1.DocumentResponseDto,
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', upload_config_1.documentUploadConfig)),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_document_dto_1.UploadDocumentDto, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload multiple documents' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Documents uploaded successfully',
        type: [upload_document_dto_1.DocumentResponseDto],
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 5, upload_config_1.documentUploadConfig)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)('types')),
    __param(2, (0, common_1.Body)('descriptions')),
    __param(3, (0, get_user_decorator_1.GetUser)()),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadMultipleDocuments", null);
__decorate([
    (0, common_1.Get)('my-documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user documents' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of user documents',
        type: [upload_document_dto_1.DocumentResponseDto],
    }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getMyDocuments", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get documents for a specific user (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of user documents',
        type: [upload_document_dto_1.DocumentResponseDto],
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getUserDocuments", null);
__decorate([
    (0, common_1.Get)('by-status/:status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get documents by status (Admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page', example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Paginated list of documents by status',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('status')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocumentsByStatus", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get document statistics (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Document statistics',
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocumentStatistics", null);
__decorate([
    (0, common_1.Get)('download/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Download a document' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Document file',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "downloadDocument", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get document details' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Document details',
        type: upload_document_dto_1.DocumentResponseDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "getDocument", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update document status (Admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Document status updated successfully',
        type: upload_document_dto_1.DocumentResponseDto,
    }),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_document_status_dto_1.UpdateDocumentStatusDto, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "updateDocumentStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a document' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Document deleted successfully',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "deleteDocument", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('Documents'),
    (0, common_1.Controller)('documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map