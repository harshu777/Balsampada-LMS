import { AttendanceStatus } from '@prisma/client';
export declare class MarkAttendanceDto {
    sessionId: string;
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
}
export declare class BulkMarkAttendanceDto {
    sessionId: string;
    attendanceData: Array<{
        studentId: string;
        status: AttendanceStatus;
        notes?: string;
    }>;
}
