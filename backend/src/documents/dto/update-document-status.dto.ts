import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from '@prisma/client';

export class UpdateDocumentStatusDto {
  @ApiProperty({
    description: 'New status for the document',
    enum: DocumentStatus,
    example: DocumentStatus.APPROVED,
  })
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @ApiProperty({
    description: 'Optional review notes from the admin/reviewer',
    required: false,
    example: 'Document verified and approved for processing',
  })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}