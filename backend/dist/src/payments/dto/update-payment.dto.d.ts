import { PaymentStatus, PaymentType, PaymentMethod } from '@prisma/client';
export declare class UpdatePaymentDto {
    amount?: number;
    type?: PaymentType;
    method?: PaymentMethod;
    status?: PaymentStatus;
    dueDate?: string;
    description?: string;
    notes?: string;
    rejectionReason?: string;
    monthYear?: string;
    academicYear?: string;
}
export declare class ApprovePaymentDto {
    notes?: string;
    receiptNumber?: string;
}
export declare class RejectPaymentDto {
    rejectionReason: string;
    notes?: string;
}
export declare class PaymentFilterDto {
    studentId?: string;
    status?: PaymentStatus;
    type?: PaymentType;
    monthYear?: string;
    academicYear?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
    limit?: string;
}
