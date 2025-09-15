import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
export declare class ClassesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createClassDto: CreateClassDto): Promise<{
        announcements: {
            priority: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string;
            isActive: boolean;
            classId: string | null;
            authorId: string;
        }[];
        _count: {
            subjects: number;
        };
        subjects: ({
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
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        academicYear: string | null;
        isActive: boolean;
        grade: string | null;
    }>;
    findAll(page?: number, limit?: number, search?: string, isActive?: boolean): Promise<{
        classes: ({
            announcements: {
                priority: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                content: string;
                isActive: boolean;
                classId: string | null;
                authorId: string;
            }[];
            _count: {
                subjects: number;
            };
            subjects: ({
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
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            academicYear: string | null;
            isActive: boolean;
            grade: string | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        announcements: ({
            author: {
                email: string;
                firstName: string;
                lastName: string;
                id: string;
            };
        } & {
            priority: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string;
            isActive: boolean;
            classId: string | null;
            authorId: string;
        })[];
        _count: {
            subjects: number;
        };
        subjects: ({
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
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        academicYear: string | null;
        isActive: boolean;
        grade: string | null;
    }>;
    update(id: string, updateClassDto: UpdateClassDto): Promise<{
        announcements: {
            priority: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            content: string;
            isActive: boolean;
            classId: string | null;
            authorId: string;
        }[];
        _count: {
            subjects: number;
        };
        subjects: ({
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
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        academicYear: string | null;
        isActive: boolean;
        grade: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getClassStats(id: string): Promise<{
        totalSubjects: number;
        totalStudents: number;
        totalTeachers: number;
        totalAssignments: number;
        totalTests: number;
    }>;
}
