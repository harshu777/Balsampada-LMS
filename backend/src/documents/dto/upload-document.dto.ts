import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DocumentType {
  ID_PROOF = 'id_proof',
  PHOTO = 'photo',
  MARKSHEET = 'marksheet',
  CERTIFICATE = 'certificate',
  RESUME = 'resume',
  EXPERIENCE_LETTER = 'experience_letter',
  QUALIFICATION = 'qualification',
  OTHER = 'other',
}

export class UploadDocumentDto {
  @ApiProperty({
    description: 'Type of document being uploaded',
    enum: DocumentType,
    example: DocumentType.ID_PROOF,
  })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @ApiProperty({
    description: 'Optional description or notes about the document',
    required: false,
    example: 'Aadhaar card copy for identity verification',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class DocumentResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the document',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Type of document',
    enum: DocumentType,
    example: DocumentType.ID_PROOF,
  })
  type: DocumentType;

  @ApiProperty({
    description: 'Original filename of the uploaded document',
    example: 'aadhaar_card.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'URL to access the document',
    example: '/api/documents/download/uuid-string',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  fileSize: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Current status of the document',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    example: 'PENDING',
  })
  status: string;

  @ApiProperty({
    description: 'Optional description provided during upload',
    required: false,
    example: 'Identity proof document',
  })
  description?: string;

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-01T00:00:00Z',
  })
  updatedAt: Date;
}