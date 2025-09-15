import { AttendanceStatus } from '@prisma/client';
export declare class AttendanceQueryDto {
    studentId?: string;
    subjectId?: string;
    sessionId?: string;
    status?: AttendanceStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export declare class AttendanceStatsQueryDto {
    studentId?: string;
    subjectId?: string;
    classId?: string;
    startDate?: string;
    endDate?: string;
    period?: 'weekly' | 'monthly' | 'yearly';
}
