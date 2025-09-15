import { AttendanceStatus } from '@prisma/client';
export declare class UpdateAttendanceDto {
    status?: AttendanceStatus;
    notes?: string;
}
