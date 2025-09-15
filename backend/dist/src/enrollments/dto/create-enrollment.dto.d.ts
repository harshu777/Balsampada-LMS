import { PaymentStatus } from '@prisma/client';
export declare class CreateEnrollmentDto {
    studentId: string;
    subjectId: string;
    enrollmentDate?: string;
    paymentStatus?: PaymentStatus;
    isActive?: boolean;
}
