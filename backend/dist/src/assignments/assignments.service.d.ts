import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto, GradeAssignmentDto } from './dto/submit-assignment.dto';
import { Role } from '@prisma/client';
export declare class AssignmentsService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(createAssignmentDto: CreateAssignmentDto, teacherId: string): Promise<{
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
            enrollments: ({
                student: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: string;
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
        description: string | null;
        title: string;
        dueDate: Date;
        subjectId: string;
        isActive: boolean;
        teacherId: string;
        instructions: string | null;
        attachmentUrl: string | null;
        totalMarks: number | null;
    }>;
    findAll(page?: number, limit?: number, search?: string, subjectId?: string, teacherId?: string, isActive?: boolean): Promise<{
        assignments: ({
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
                submissions: number;
            };
            teacher: {
                email: string;
                firstName: string;
                lastName: string;
                id: string;
            };
            submissions: ({
                student: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                studentId: string;
                assignmentId: string;
                submissionText: string | null;
                submissionUrl: string | null;
                marksObtained: number | null;
                feedback: string | null;
                submittedAt: Date | null;
                gradedAt: Date | null;
            })[];
        } & {
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
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, userId: string, userRole: Role): Promise<{
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
            enrollments: ({
                student: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: string;
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
        _count: {
            submissions: number;
        };
        teacher: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        submissions: ({
            student: {
                email: string;
                firstName: string;
                lastName: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            assignmentId: string;
            submissionText: string | null;
            submissionUrl: string | null;
            marksObtained: number | null;
            feedback: string | null;
            submittedAt: Date | null;
            gradedAt: Date | null;
        })[];
    } & {
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
    }>;
    findStudentAssignments(studentId: string, page?: number, limit?: number, status?: 'pending' | 'submitted' | 'graded'): Promise<{
        assignments: ({
            assignment: {
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
                description: string | null;
                title: string;
                dueDate: Date;
                subjectId: string;
                isActive: boolean;
                teacherId: string;
                instructions: string | null;
                attachmentUrl: string | null;
                totalMarks: number | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            assignmentId: string;
            submissionText: string | null;
            submissionUrl: string | null;
            marksObtained: number | null;
            feedback: string | null;
            submittedAt: Date | null;
            gradedAt: Date | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    update(id: string, updateAssignmentDto: UpdateAssignmentDto, teacherId: string, userRole: Role): Promise<{
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
            submissions: number;
        };
        teacher: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
        submissions: ({
            student: {
                email: string;
                firstName: string;
                lastName: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            assignmentId: string;
            submissionText: string | null;
            submissionUrl: string | null;
            marksObtained: number | null;
            feedback: string | null;
            submittedAt: Date | null;
            gradedAt: Date | null;
        })[];
    } & {
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
    }>;
    remove(id: string, teacherId: string, userRole: Role): Promise<{
        message: string;
    }>;
    submitAssignment(submitDto: SubmitAssignmentDto, studentId: string, attachmentUrl?: string): Promise<{
        assignment: {
            subject: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                isActive: boolean;
                classId: string;
            };
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
            description: string | null;
            title: string;
            dueDate: Date;
            subjectId: string;
            isActive: boolean;
            teacherId: string;
            instructions: string | null;
            attachmentUrl: string | null;
            totalMarks: number | null;
        };
        student: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        assignmentId: string;
        submissionText: string | null;
        submissionUrl: string | null;
        marksObtained: number | null;
        feedback: string | null;
        submittedAt: Date | null;
        gradedAt: Date | null;
    }>;
    gradeAssignment(gradeDto: GradeAssignmentDto, teacherId: string, userRole: Role): Promise<{
        assignment: {
            subject: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                isActive: boolean;
                classId: string;
            };
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
            description: string | null;
            title: string;
            dueDate: Date;
            subjectId: string;
            isActive: boolean;
            teacherId: string;
            instructions: string | null;
            attachmentUrl: string | null;
            totalMarks: number | null;
        };
        student: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        assignmentId: string;
        submissionText: string | null;
        submissionUrl: string | null;
        marksObtained: number | null;
        feedback: string | null;
        submittedAt: Date | null;
        gradedAt: Date | null;
    }>;
    getAssignmentStats(assignmentId: string, teacherId: string, userRole: Role): Promise<{
        totalStudents: number;
        totalSubmissions: number;
        pendingSubmissions: number;
        gradedSubmissions: number;
        pendingGrading: number;
        submissionRate: number;
        gradingRate: number;
        averageMarks: number;
        maxMarks: number;
        minMarks: number;
        totalMarks: number | null;
    }>;
}
