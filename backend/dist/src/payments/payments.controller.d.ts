import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto, ApprovePaymentDto, RejectPaymentDto, PaymentFilterDto } from './dto';
import type { Response } from 'express';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPayment(createPaymentDto: CreatePaymentDto, proofFile: Express.Multer.File, req: any): Promise<{
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
    getPayments(filters: PaymentFilterDto, req: any): Promise<{
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
    getPaymentStatistics(filters: {
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
    getPaymentById(id: string, req: any): Promise<{
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
    getPaymentProof(id: string, req: any, res: Response): Promise<void>;
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
    approvePayment(id: string, approvePaymentDto: ApprovePaymentDto, req: any): Promise<{
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
    rejectPayment(id: string, rejectPaymentDto: RejectPaymentDto, req: any): Promise<{
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
    createMonthlyPayment(createPaymentDto: Omit<CreatePaymentDto, 'studentId' | 'type'>, proofFile: Express.Multer.File, req: any): Promise<{
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
    getStudentPaymentHistory(filters: PaymentFilterDto, req: any): Promise<{
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
    getPendingPayments(filters: PaymentFilterDto): Promise<{
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
    bulkApprovePayments({ paymentIds, notes }: {
        paymentIds: string[];
        notes?: string;
    }, req: any): Promise<{
        message: string;
        results: PromiseSettledResult<{
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
        }>[];
    }>;
    bulkRejectPayments({ paymentIds, rejectionReason, notes }: {
        paymentIds: string[];
        rejectionReason: string;
        notes?: string;
    }, req: any): Promise<{
        message: string;
        results: PromiseSettledResult<{
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
        }>[];
    }>;
    generateReceipt(id: string, req: any): Promise<{
        message: string;
        payment: {
            receiptNumber: string | null;
            amount: number;
            approvalDate: Date | null;
        };
    }>;
}
