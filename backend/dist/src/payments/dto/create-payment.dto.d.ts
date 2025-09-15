import { PaymentType, PaymentMethod } from '@prisma/client';
export declare class CreatePaymentDto {
    enrollmentId?: string;
    studentId: string;
    amount: number;
    type: PaymentType;
    method: PaymentMethod;
    dueDate?: string;
    description?: string;
    notes?: string;
    monthYear?: string;
    academicYear?: string;
}
