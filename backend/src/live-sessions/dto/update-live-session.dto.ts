import { PartialType } from '@nestjs/mapped-types';
import { CreateLiveSessionDto } from './create-live-session.dto';
import { IsOptional, IsUrl, IsBoolean } from 'class-validator';

export class UpdateLiveSessionDto extends PartialType(CreateLiveSessionDto) {
  @IsOptional()
  @IsUrl()
  recordingUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}