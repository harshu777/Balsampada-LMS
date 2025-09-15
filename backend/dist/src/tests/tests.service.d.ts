import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { SubmitTestDto, StartTestDto } from './dto/submit-test.dto';
import { Role } from '@prisma/client';
export declare class TestsService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(createTestDto: CreateTestDto, teacherId: string): Promise<{
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
        subjectId: string;
        isActive: boolean;
        teacherId: string;
        totalMarks: number;
        questions: import("@prisma/client/runtime/library").JsonValue;
        duration: number;
        startTime: Date;
        endTime: Date;
    }>;
    findAll(page?: number, limit?: number, search?: string, subjectId?: string, teacherId?: string, isActive?: boolean): Promise<{
        tests: ({
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
                attempts: number;
            };
            teacher: {
                email: string;
                firstName: string;
                lastName: string;
                id: string;
            };
            attempts: ({
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
                marksObtained: number | null;
                feedback: string | null;
                submittedAt: Date | null;
                testId: string;
                answers: import("@prisma/client/runtime/library").JsonValue;
                startedAt: Date;
                attemptedAt: Date;
                isPassed: boolean;
                isCompleted: boolean;
            })[];
        } & {
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
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, userId: string, userRole: Role, includeAnswers?: boolean): Promise<{
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
        attempts: ({
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
            marksObtained: number | null;
            feedback: string | null;
            submittedAt: Date | null;
            testId: string;
            answers: import("@prisma/client/runtime/library").JsonValue;
            startedAt: Date;
            attemptedAt: Date;
            isPassed: boolean;
            isCompleted: boolean;
        })[];
    } & {
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
    }>;
    findStudentTests(studentId: string, page?: number, limit?: number, status?: 'upcoming' | 'ongoing' | 'completed'): Promise<{
        tests: {
            questions: any[];
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
            attempts: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                studentId: string;
                marksObtained: number | null;
                feedback: string | null;
                submittedAt: Date | null;
                testId: string;
                answers: import("@prisma/client/runtime/library").JsonValue;
                startedAt: Date;
                attemptedAt: Date;
                isPassed: boolean;
                isCompleted: boolean;
            }[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            subjectId: string;
            isActive: boolean;
            teacherId: string;
            totalMarks: number;
            duration: number;
            startTime: Date;
            endTime: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    update(id: string, updateTestDto: UpdateTestDto, teacherId: string, userRole: Role): Promise<{
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
        attempts: ({
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
            marksObtained: number | null;
            feedback: string | null;
            submittedAt: Date | null;
            testId: string;
            answers: import("@prisma/client/runtime/library").JsonValue;
            startedAt: Date;
            attemptedAt: Date;
            isPassed: boolean;
            isCompleted: boolean;
        })[];
    } & {
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
    }>;
    remove(id: string, teacherId: string, userRole: Role): Promise<{
        message: string;
    }>;
    startTest(startDto: StartTestDto, studentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        marksObtained: number | null;
        feedback: string | null;
        submittedAt: Date | null;
        testId: string;
        answers: import("@prisma/client/runtime/library").JsonValue;
        startedAt: Date;
        attemptedAt: Date;
        isPassed: boolean;
        isCompleted: boolean;
    }>;
    submitTest(submitDto: SubmitTestDto, studentId: string): Promise<{
        test: {
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
            subjectId: string;
            isActive: boolean;
            teacherId: string;
            totalMarks: number;
            questions: import("@prisma/client/runtime/library").JsonValue;
            duration: number;
            startTime: Date;
            endTime: Date;
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
        marksObtained: number | null;
        feedback: string | null;
        submittedAt: Date | null;
        testId: string;
        answers: import("@prisma/client/runtime/library").JsonValue;
        startedAt: Date;
        attemptedAt: Date;
        isPassed: boolean;
        isCompleted: boolean;
    }>;
    getTestResults(testId: string, studentId: string): Promise<{
        test: {
            questions: import("@prisma/client/runtime/library").JsonValue;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            subjectId: string;
            isActive: boolean;
            teacherId: string;
            totalMarks: number;
            duration: number;
            startTime: Date;
            endTime: Date;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        studentId: string;
        marksObtained: number | null;
        feedback: string | null;
        submittedAt: Date | null;
        testId: string;
        answers: import("@prisma/client/runtime/library").JsonValue;
        startedAt: Date;
        attemptedAt: Date;
        isPassed: boolean;
        isCompleted: boolean;
    }>;
    getTestStats(testId: string, teacherId: string, userRole: Role): Promise<{
        totalStudents: number;
        totalAttempts: number;
        notAttempted: number;
        attemptRate: number;
        averageMarks: number;
        maxMarks: number;
        minMarks: number;
        totalMarks: number;
        passedStudents: number;
        failedStudents: number;
        passRate: number;
        averageTime: number;
    }>;
    private hideAnswersFromQuestions;
    private calculateMarks;
    private calculateAverageTime;
}
