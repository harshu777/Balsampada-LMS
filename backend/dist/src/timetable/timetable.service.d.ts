import { PrismaService } from '../prisma/prisma.service';
import { CreateTimetableDto, UpdateTimetableDto } from './dto/timetable.dto';
export declare class TimetableService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTimetableDto: CreateTimetableDto, userId: string): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        subjectId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        roomNumber: string | null;
        isRecurring: boolean;
    }>;
    findAll(userId: string, userRole: string, startDate?: Date, endDate?: Date): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        subjectId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        roomNumber: string | null;
        isRecurring: boolean;
    })[]>;
    findByWeek(userId: string, userRole: string, date?: Date): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        subjectId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        roomNumber: string | null;
        isRecurring: boolean;
    })[]>;
    findByDay(userId: string, userRole: string, date?: Date): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        subjectId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        roomNumber: string | null;
        isRecurring: boolean;
    })[]>;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        subjectId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        roomNumber: string | null;
        isRecurring: boolean;
    }>;
    update(id: string, updateTimetableDto: UpdateTimetableDto, userId: string): Promise<{
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        subjectId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        roomNumber: string | null;
        isRecurring: boolean;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        subjectId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        roomNumber: string | null;
        isRecurring: boolean;
    }>;
    private checkTimeConflicts;
    private timeToMinutes;
    getUpcomingSessions(userId: string, userRole: string, limit?: number): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date | null;
        endDate: Date | null;
        subjectId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: number;
        roomNumber: string | null;
        isRecurring: boolean;
    })[]>;
}
