import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto, ApprovePaymentDto, RejectPaymentDto, PaymentFilterDto } from './dto';
import { Role } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export declare class PaymentsService {
    private prisma;
    private notificationsGateway;
    constructor(prisma: PrismaService, notificationsGateway: NotificationsGateway);
    createPayment(createPaymentDto: CreatePaymentDto, paidByUserId: string, proofFile?: Express.Multer.File): Promise<{
        enrollment: ({
            subject: {
                class: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    academicYear: string | null;
                    isActive: boolean;
                    grade: string | null;
                };
            } & {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                isActive: boolean;
                classId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            subjectId: string;
            enrollmentDate: Date;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            isActive: boolean;
        }) | null;
        student: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        paidByUser: {
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.PaymentType;
        enrollmentId: string | null;
        studentId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        dueDate: Date | null;
        notes: string | null;
        monthYear: string | null;
        academicYear: string | null;
        rejectionReason: string | null;
        receiptNumber: string | null;
        paymentDate: Date;
        approvalDate: Date | null;
        proofFileUrl: string | null;
        proofFileName: string | null;
        paidBy: string;
        approvedBy: string | null;
    }>;
    getPayments(filters: PaymentFilterDto, userRole: Role, userId?: string): Promise<{
        payments: ({
            enrollment: ({
                subject: {
                    class: {
                        name: string;
                        id: string;
                        createdAt: Date;
                        updatedAt: Date;
                        description: string | null;
                        academicYear: string | null;
                        isActive: boolean;
                        grade: string | null;
                    };
                } & {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    isActive: boolean;
                    classId: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                studentId: string;
                subjectId: string;
                enrollmentDate: Date;
                paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
                isActive: boolean;
            }) | null;
            student: {
                email: string;
                firstName: string;
                lastName: string;
                id: string;
            };
            paidByUser: {
                firstName: string;
                lastName: string;
                role: import("@prisma/client").$Enums.Role;
                id: string;
            };
            approvedByUser: {
                firstName: string;
                lastName: string;
                id: string;
            } | null;
        } & {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            type: import("@prisma/client").$Enums.PaymentType;
            enrollmentId: string | null;
            studentId: string;
            amount: number;
            method: import("@prisma/client").$Enums.PaymentMethod;
            dueDate: Date | null;
            notes: string | null;
            monthYear: string | null;
            academicYear: string | null;
            rejectionReason: string | null;
            receiptNumber: string | null;
            paymentDate: Date;
            approvalDate: Date | null;
            proofFileUrl: string | null;
            proofFileName: string | null;
            paidBy: string;
            approvedBy: string | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPaymentById(id: string, userRole: Role, userId?: string): Promise<{
        enrollment: ({
            subject: {
                class: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    academicYear: string | null;
                    isActive: boolean;
                    grade: string | null;
                };
            } & {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                isActive: boolean;
                classId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            subjectId: string;
            enrollmentDate: Date;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            isActive: boolean;
        }) | null;
        student: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            id: string;
        };
        paidByUser: {
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
        };
        approvedByUser: {
            firstName: string;
            lastName: string;
            id: string;
        } | null;
    } & {
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.PaymentType;
        enrollmentId: string | null;
        studentId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        dueDate: Date | null;
        notes: string | null;
        monthYear: string | null;
        academicYear: string | null;
        rejectionReason: string | null;
        receiptNumber: string | null;
        paymentDate: Date;
        approvalDate: Date | null;
        proofFileUrl: string | null;
        proofFileName: string | null;
        paidBy: string;
        approvedBy: string | null;
    }>;
    updatePayment(id: string, updatePaymentDto: UpdatePaymentDto): Promise<{
        student: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        paidByUser: {
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.PaymentType;
        enrollmentId: string | null;
        studentId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        dueDate: Date | null;
        notes: string | null;
        monthYear: string | null;
        academicYear: string | null;
        rejectionReason: string | null;
        receiptNumber: string | null;
        paymentDate: Date;
        approvalDate: Date | null;
        proofFileUrl: string | null;
        proofFileName: string | null;
        paidBy: string;
        approvedBy: string | null;
    }>;
    approvePayment(id: string, approvePaymentDto: ApprovePaymentDto, approvedByUserId: string): Promise<{
        student: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        approvedByUser: {
            firstName: string;
            lastName: string;
            id: string;
        } | null;
    } & {
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.PaymentType;
        enrollmentId: string | null;
        studentId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        dueDate: Date | null;
        notes: string | null;
        monthYear: string | null;
        academicYear: string | null;
        rejectionReason: string | null;
        receiptNumber: string | null;
        paymentDate: Date;
        approvalDate: Date | null;
        proofFileUrl: string | null;
        proofFileName: string | null;
        paidBy: string;
        approvedBy: string | null;
    }>;
    rejectPayment(id: string, rejectPaymentDto: RejectPaymentDto, rejectedByUserId: string): Promise<{
        student: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        approvedByUser: {
            firstName: string;
            lastName: string;
            id: string;
        } | null;
    } & {
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.PaymentType;
        enrollmentId: string | null;
        studentId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        dueDate: Date | null;
        notes: string | null;
        monthYear: string | null;
        academicYear: string | null;
        rejectionReason: string | null;
        receiptNumber: string | null;
        paymentDate: Date;
        approvalDate: Date | null;
        proofFileUrl: string | null;
        proofFileName: string | null;
        paidBy: string;
        approvedBy: string | null;
    }>;
    getPaymentStatistics(filters?: {
        academicYear?: string;
        monthYear?: string;
    }): Promise<{
        overview: {
            totalPayments: number;
            pendingPayments: number;
            approvedPayments: number;
            rejectedPayments: number;
            totalAmount: number;
            approvedAmount: number;
        };
        monthlyStats: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.PaymentGroupByOutputType, "monthYear"[]> & {
            _count: number;
            _sum: {
                amount: number | null;
            };
        })[];
    }>;
    getOverduePayments(): Promise<({
        student: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            id: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.PaymentType;
        enrollmentId: string | null;
        studentId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        dueDate: Date | null;
        notes: string | null;
        monthYear: string | null;
        academicYear: string | null;
        rejectionReason: string | null;
        receiptNumber: string | null;
        paymentDate: Date;
        approvalDate: Date | null;
        proofFileUrl: string | null;
        proofFileName: string | null;
        paidBy: string;
        approvedBy: string | null;
    })[]>;
    deletePayment(id: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.PaymentType;
        enrollmentId: string | null;
        studentId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        dueDate: Date | null;
        notes: string | null;
        monthYear: string | null;
        academicYear: string | null;
        rejectionReason: string | null;
        receiptNumber: string | null;
        paymentDate: Date;
        approvalDate: Date | null;
        proofFileUrl: string | null;
        proofFileName: string | null;
        paidBy: string;
        approvedBy: string | null;
    }>;
    private generateReceiptNumber;
    private createPaymentNotification;
}
