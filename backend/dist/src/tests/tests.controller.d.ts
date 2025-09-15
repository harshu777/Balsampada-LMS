import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { SubmitTestDto, StartTestDto } from './dto/submit-test.dto';
import { Role } from '@prisma/client';
export declare class TestsController {
    private readonly testsService;
    constructor(testsService: TestsService);
    create(createTestDto: CreateTestDto, user: {
        id: string;
        role: Role;
    }): Promise<{
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
    findAll(page?: string, limit?: string, search?: string, subjectId?: string, teacherId?: string, isActive?: string): Promise<{
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
    findMyTests(user: {
        id: string;
        role: Role;
    }, page?: string, limit?: string, status?: 'upcoming' | 'ongoing' | 'completed'): Promise<{
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
    findOne(id: string, user: {
        id: string;
        role: Role;
    }, includeAnswers?: string): Promise<{
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
    getTestStats(id: string, user: {
        id: string;
        role: Role;
    }): Promise<{
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
    getTestResults(id: string, user: {
        id: string;
        role: Role;
    }): Promise<{
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
    update(id: string, updateTestDto: UpdateTestDto, user: {
        id: string;
        role: Role;
    }): Promise<{
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
    remove(id: string, user: {
        id: string;
        role: Role;
    }): Promise<{
        message: string;
    }>;
    startTest(startDto: StartTestDto, user: {
        id: string;
        role: Role;
    }): Promise<{
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
    submitTest(submitDto: SubmitTestDto, user: {
        id: string;
        role: Role;
    }): Promise<{
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
}
