import { IsString, IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class SubmitAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  assignmentId: string;

  @IsString()
  @IsOptional()
  submissionText?: string;

  @IsString()
  @IsOptional()
  submissionUrl?: string;
}

export class GradeAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  studentAssignmentId: string;

  @IsOptional()
  marksObtained?: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}