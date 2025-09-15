import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean, IsInt, IsDateString, Min, Max, Matches } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateTimetableDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ description: 'Day of week (0 = Sunday, 6 = Saturday)' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ description: 'Start time in HH:MM format' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime: string;

  @ApiProperty({ description: 'End time in HH:MM format' })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean = true;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: Date;
}

export class UpdateTimetableDto extends PartialType(CreateTimetableDto) {}