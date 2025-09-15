import { IsString, IsOptional, IsBoolean, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'The ID of the student to enroll' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ description: 'The ID of the subject to enroll in' })
  @IsUUID()
  subjectId: string;

  @ApiProperty({ 
    description: 'The enrollment date',
    required: false,
    example: '2024-01-15T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @ApiProperty({ 
    description: 'The payment status of the enrollment',
    enum: PaymentStatus,
    required: false,
    default: PaymentStatus.PENDING
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({ 
    description: 'Whether the enrollment is active',
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}