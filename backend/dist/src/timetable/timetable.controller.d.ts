import { TimetableService } from './timetable.service';
import { CreateTimetableDto, UpdateTimetableDto } from './dto/timetable.dto';
export declare class TimetableController {
    private readonly timetableService;
    constructor(timetableService: TimetableService);
    create(createTimetableDto: CreateTimetableDto, req: any): Promise<{
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
    findAll(startDate?: string, endDate?: string, req?: any): Promise<({
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
    findByWeek(date?: string, req?: any): Promise<({
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
    findByDay(date?: string, req?: any): Promise<({
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
    getUpcoming(limit?: string, req?: any): Promise<({
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
    update(id: string, updateTimetableDto: UpdateTimetableDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
}
