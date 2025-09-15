import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class MarkAttendanceDto {
  @IsString()
  sessionId: string;

  @IsString()
  studentId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkMarkAttendanceDto {
  @IsString()
  sessionId: string;

  @IsArray()
  attendanceData: Array<{
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
  }>;
}