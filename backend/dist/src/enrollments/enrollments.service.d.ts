import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { PaymentStatus } from '@prisma/client';
export declare class EnrollmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createEnrollmentDto: CreateEnrollmentDto): Promise<{
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
        student: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        payments: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        subjectId: string;
        enrollmentDate: Date;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        isActive: boolean;
    }>;
    findAll(page?: number, limit?: number, search?: string, subjectId?: string, studentId?: string, isActive?: boolean, paymentStatus?: PaymentStatus): Promise<{
        enrollments: ({
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
            _count: {
                payments: number;
            };
            student: {
                email: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                id: string;
            };
            payments: {
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
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            subjectId: string;
            enrollmentDate: Date;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            isActive: boolean;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
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
            teachers: ({
                teacher: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                subjectId: string;
                isActive: boolean;
                teacherId: string;
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            classId: string;
        };
        student: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            address: string | null;
            id: string;
        };
        payments: ({
            paidByUser: {
                email: string;
                firstName: string;
                lastName: string;
                id: string;
            };
            approvedByUser: {
                email: string;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        subjectId: string;
        enrollmentDate: Date;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        isActive: boolean;
    }>;
    updateStatus(id: string, isActive: boolean, paymentStatus?: PaymentStatus): Promise<{
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
        student: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        payments: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        subjectId: string;
        enrollmentDate: Date;
        paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findByStudent(studentId: string, page?: number, limit?: number, isActive?: boolean): Promise<{
        enrollments: ({
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
                assignments: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    title: string;
                    dueDate: Date;
                    subjectId: string;
                    isActive: boolean;
                    teacherId: string;
                    instructions: string | null;
                    attachmentUrl: string | null;
                    totalMarks: number | null;
                }[];
                tests: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    title: string;
                    subjectId: string;
                    isActive: boolean;
                    teacherId: string;
                    totalMarks: number;
                    questions: import("@prisma/client/runtime/library").JsonValue;
                    duration: number;
                    startTime: Date;
                    endTime: Date;
                }[];
                teachers: ({
                    teacher: {
                        email: string;
                        firstName: string;
                        lastName: string;
                        id: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    subjectId: string;
                    isActive: boolean;
                    teacherId: string;
                })[];
                materials: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    type: string | null;
                    title: string;
                    fileName: string | null;
                    fileUrl: string | null;
                    fileSize: number | null;
                    content: string | null;
                    subjectId: string;
                    isActive: boolean;
                    fileType: string | null;
                    uploadedById: string;
                    downloadCount: number;
                }[];
            } & {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                isActive: boolean;
                classId: string;
            };
            payments: {
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
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            subjectId: string;
            enrollmentDate: Date;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            isActive: boolean;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findBySubject(subjectId: string, page?: number, limit?: number, isActive?: boolean): Promise<{
        enrollments: ({
            student: {
                email: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                id: string;
            };
            payments: {
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
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            subjectId: string;
            enrollmentDate: Date;
            paymentStatus: import("@prisma/client").$Enums.PaymentStatus;
            isActive: boolean;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getEnrollmentStats(): Promise<{
        totalEnrollments: number;
        activeEnrollments: number;
        inactiveEnrollments: number;
        paymentStats: {
            pending: number;
            approved: number;
            rejected: number;
        };
        enrollmentTrend: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.StudentEnrollmentGroupByOutputType, "enrollmentDate"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
    bulkUpdateStatus(enrollmentIds: string[], isActive: boolean, paymentStatus?: PaymentStatus): Promise<{
        message: string;
        updatedCount: number;
    }>;
}
