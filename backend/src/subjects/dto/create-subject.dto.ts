import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ description: 'The name of the subject' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the subject', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The ID of the class this subject belongs to' })
  @IsUUID()
  classId: string;

  @ApiProperty({ description: 'Whether the subject is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}