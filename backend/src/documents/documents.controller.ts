import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Req,
  Res,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto, DocumentResponseDto, DocumentType } from './dto/upload-document.dto';
import { UpdateDocumentStatusDto } from './dto/update-document-status.dto';
import { documentUploadConfig } from '../config/upload.config';
import { Role, DocumentStatus } from '@prisma/client';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a single document' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    type: DocumentResponseDto,
  })
  @UseInterceptors(FileInterceptor('file', documentUploadConfig))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
    @GetUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<DocumentResponseDto> {
    if (!file) {
      throw new Error('No file provided');
    }

    const document = await this.documentsService.uploadDocument(
      user.id,
      file,
      uploadDto,
      req,
    );

    return {
      id: document.id,
      type: document.type as DocumentType,
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

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload multiple documents' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Documents uploaded successfully',
    type: [DocumentResponseDto],
  })
  @UseInterceptors(FilesInterceptor('files', 5, documentUploadConfig))
  async uploadMultipleDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('types') types: string,
    @Body('descriptions') descriptions: string,
    @GetUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<DocumentResponseDto[]> {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const documentTypes = types.split(',').map(type => type.trim() as DocumentType);
    const documentDescriptions = descriptions ? descriptions.split(',').map(desc => desc.trim()) : [];

    const documents = await this.documentsService.uploadMultipleDocuments(
      user.id,
      files,
      documentTypes,
      documentDescriptions,
      req,
    );

    return documents.map(document => ({
      id: document.id,
      type: document.type as DocumentType,
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

  @Get('my-documents')
  @ApiOperation({ summary: 'Get current user documents' })
  @ApiResponse({
    status: 200,
    description: 'List of user documents',
    type: [DocumentResponseDto],
  })
  async getMyDocuments(@GetUser() user: AuthenticatedUser): Promise<DocumentResponseDto[]> {
    const documents = await this.documentsService.getUserDocuments(user.id);

    return documents.map(document => ({
      id: document.id,
      type: document.type as DocumentType,
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

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get documents for a specific user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of user documents',
    type: [DocumentResponseDto],
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getUserDocuments(
    @Param('userId') userId: string,
    @GetUser() user: AuthenticatedUser,
  ): Promise<DocumentResponseDto[]> {
    const documents = await this.documentsService.getDocumentsByUserId(
      userId,
      user.id,
      user.role,
    );

    return documents.map(document => ({
      id: document.id,
      type: document.type as DocumentType,
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

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get documents by status (Admin only)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of documents by status',
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getDocumentsByStatus(
    @Param('status') status: DocumentStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.documentsService.getDocumentsByStatus(status, page, limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get document statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Document statistics',
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getDocumentStatistics() {
    return this.documentsService.getDocumentStatistics();
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Download a document' })
  @ApiResponse({
    status: 200,
    description: 'Document file',
  })
  async downloadDocument(
    @Param('id') documentId: string,
    @GetUser() user: AuthenticatedUser,
    @Res() res: Response,
  ): Promise<void> {
    const { filePath, fileName } = await this.documentsService.downloadDocument(
      documentId,
      user.id,
      user.role,
    );

    if (!existsSync(filePath)) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    const fileStream = createReadStream(filePath);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    fileStream.pipe(res);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document details' })
  @ApiResponse({
    status: 200,
    description: 'Document details',
    type: DocumentResponseDto,
  })
  async getDocument(
    @Param('id') documentId: string,
    @GetUser() user: AuthenticatedUser,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentsService.getDocumentById(
      documentId,
      user.id,
      user.role,
    );

    return {
      id: document.id,
      type: document.type as DocumentType,
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

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update document status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Document status updated successfully',
    type: DocumentResponseDto,
  })
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateDocumentStatus(
    @Param('id') documentId: string,
    @Body() updateDto: UpdateDocumentStatusDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentsService.updateDocumentStatus(
      documentId,
      updateDto,
      user.id,
    );

    return {
      id: document.id,
      type: document.type as DocumentType,
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully',
  })
  async deleteDocument(
    @Param('id') documentId: string,
    @GetUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.documentsService.deleteDocument(documentId, user.id, user.role);
    return { message: 'Document deleted successfully' };
  }
}