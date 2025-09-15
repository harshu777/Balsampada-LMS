import { AttendanceService } from './attendance.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class AttendanceSchedulerService {
    private attendanceService;
    private notificationsService;
    private prisma;
    private readonly logger;
    constructor(attendanceService: AttendanceService, notificationsService: NotificationsService, prisma: PrismaService);
    checkLowAttendanceDaily(): Promise<void>;
    sendWeeklyAttendanceSummary(): Promise<void>;
    checkMissedSessions(): Promise<void>;
    sendMonthlyAttendanceReport(): Promise<void>;
    sendAttendanceAlert(studentId: string, subjectId: string, customMessage?: string): Promise<void>;
    sendParentNotifications(studentId: string, attendancePercentage: number): Promise<void>;
}
