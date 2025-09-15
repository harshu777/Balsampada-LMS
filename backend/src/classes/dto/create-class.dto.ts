import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ description: 'The name of the class' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the class', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Grade level of the class', required: false })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({ description: 'Academic year of the class', required: false })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiProperty({ description: 'Whether the class is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}