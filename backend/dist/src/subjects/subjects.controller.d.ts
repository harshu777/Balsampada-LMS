import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
export declare class SubjectsController {
    private readonly subjectsService;
    constructor(subjectsService: SubjectsService);
    create(createSubjectDto: CreateSubjectDto): Promise<{
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
        _count: {
            assignments: number;
            tests: number;
            teachers: number;
            enrollments: number;
            materials: number;
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
    }>;
    findAll(page: number, limit: number, search?: string, classId?: string, isActive?: boolean): Promise<{
        subjects: ({
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
            _count: {
                assignments: number;
                tests: number;
                teachers: number;
                enrollments: number;
                materials: number;
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
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findMySubjects(req: any, page: number, limit: number): Promise<{
        subjects: ({
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
            _count: {
                assignments: number;
                tests: number;
                enrollments: number;
                materials: number;
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
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
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
        assignments: ({
            teacher: {
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
        })[];
        tests: ({
            teacher: {
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
        })[];
        _count: {
            assignments: number;
            tests: number;
            teachers: number;
            enrollments: number;
            materials: number;
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
    }>;
    getStats(id: string): Promise<{
        totalTeachers: number;
        totalStudents: number;
        totalMaterials: number;
        totalAssignments: number;
        totalTests: number;
    }>;
    assignTeacher(id: string, teacherId: string): Promise<{
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
        subjectId: string;
        isActive: boolean;
        teacherId: string;
    }>;
    unassignTeacher(id: string, teacherId: string): Promise<{
        message: string;
    }>;
    update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<{
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
        _count: {
            assignments: number;
            tests: number;
            teachers: number;
            enrollments: number;
            materials: number;
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
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
