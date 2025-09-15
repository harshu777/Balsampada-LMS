import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto, GradeAssignmentDto } from './dto/submit-assignment.dto';
import { Role } from '@prisma/client';
import { Request } from 'express';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        role: Role;
    };
}
export declare class AssignmentsController {
    private readonly assignmentsService;
    constructor(assignmentsService: AssignmentsService);
    create(createAssignmentDto: CreateAssignmentDto, user: {
        id: string;
        role: Role;
    }, attachment?: Express.Multer.File, req?: AuthenticatedRequest): Promise<{
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
    findAll(page?: string, limit?: string, search?: string, subjectId?: string, teacherId?: string, isActive?: string): Promise<{
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
    findMyAssignments(user: {
        id: string;
        role: Role;
    }, page?: string, limit?: string, status?: 'pending' | 'submitted' | 'graded'): Promise<{
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
    findOne(id: string, user: {
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
    getAssignmentStats(id: string, user: {
        id: string;
        role: Role;
    }): Promise<{
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
    update(id: string, updateAssignmentDto: UpdateAssignmentDto, user: {
        id: string;
        role: Role;
    }, attachment?: Express.Multer.File): Promise<{
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
    remove(id: string, user: {
        id: string;
        role: Role;
    }): Promise<{
        message: string;
    }>;
    submitAssignment(submitDto: SubmitAssignmentDto, user: {
        id: string;
        role: Role;
    }, submission?: Express.Multer.File): Promise<{
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
    gradeAssignment(gradeDto: GradeAssignmentDto, user: {
        id: string;
        role: Role;
    }): Promise<{
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
}
export {};
