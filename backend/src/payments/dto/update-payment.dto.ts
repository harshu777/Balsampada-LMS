import { IsEnum, IsOptional, IsString, IsDateString, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { PaymentStatus, PaymentType, PaymentMethod } from '@prisma/client';

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  monthYear?: string;

  @IsOptional()
  @IsString()
  academicYear?: string;
}

export class ApprovePaymentDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  receiptNumber?: string;
}

export class RejectPaymentDto {
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PaymentFilterDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @IsOptional()
  @IsString()
  monthYear?: string;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}