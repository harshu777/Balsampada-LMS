import { IsString, IsNotEmpty, IsOptional, IsInt, IsDateString, IsUUID, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  totalMarks?: number;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  isActive?: boolean = true;
}