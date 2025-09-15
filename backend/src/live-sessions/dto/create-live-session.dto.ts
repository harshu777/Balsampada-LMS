import { IsString, IsOptional, IsDateString, IsUrl, IsUUID } from 'class-validator';

export class CreateLiveSessionDto {
  @IsUUID()
  subjectId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsUrl()
  meetingUrl?: string;
}