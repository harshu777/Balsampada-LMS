import { AttendanceService } from './attendance.service';
import { AttendanceSchedulerService } from './attendance-scheduler.service';
import { MarkAttendanceDto, BulkMarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceQueryDto, AttendanceStatsQueryDto } from './dto/attendance-query.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    private readonly attendanceSchedulerService;
    constructor(attendanceService: AttendanceService, attendanceSchedulerService: AttendanceSchedulerService);
    markAttendance(markAttendanceDto: MarkAttendanceDto, req: any): Promise<{
        status: string;
        message: string;
        data: {
            student: {
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                address: string | null;
                role: import("@prisma/client").$Enums.Role;
                id: string;
                profileImage: string | null;
                status: import("@prisma/client").$Enums.UserStatus;
                refreshToken: string | null;
                emailVerified: boolean;
                emailVerificationToken: string | null;
                resetPasswordToken: string | null;
                resetPasswordExpiry: Date | null;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
            session: ({
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
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                subjectId: string;
                isActive: boolean;
                teacherId: string;
                startTime: Date;
                endTime: Date;
                meetingUrl: string | null;
                recordingUrl: string | null;
            }) | null;
        } & {
            date: Date;
            id: string;
            status: import("@prisma/client").$Enums.AttendanceStatus;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            notes: string | null;
            subjectId: string | null;
            sessionId: string | null;
            markedBy: string | null;
        };
    }>;
    bulkMarkAttendance(bulkMarkAttendanceDto: BulkMarkAttendanceDto, req: any): Promise<{
        status: string;
        message: string;
        data: any[];
    }>;
    updateAttendance(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<{
        status: string;
        message: string;
        data: {
            student: {
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                address: string | null;
                role: import("@prisma/client").$Enums.Role;
                id: string;
                profileImage: string | null;
                status: import("@prisma/client").$Enums.UserStatus;
                refreshToken: string | null;
                emailVerified: boolean;
                emailVerificationToken: string | null;
                resetPasswordToken: string | null;
                resetPasswordExpiry: Date | null;
                lastLogin: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
            session: ({
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
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                subjectId: string;
                isActive: boolean;
                teacherId: string;
                startTime: Date;
                endTime: Date;
                meetingUrl: string | null;
                recordingUrl: string | null;
            }) | null;
        } & {
            date: Date;
            id: string;
            status: import("@prisma/client").$Enums.AttendanceStatus;
            createdAt: Date;
            updatedAt: Date;
            studentId: string;
            notes: string | null;
            subjectId: string | null;
            sessionId: string | null;
            markedBy: string | null;
        };
    }>;
    getAttendance(query: AttendanceQueryDto): Promise<{
        status: string;
        message: string;
        data: {
            attendance: ({
                student: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: string;
                };
                session: ({
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
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    title: string;
                    subjectId: string;
                    isActive: boolean;
                    teacherId: string;
                    startTime: Date;
                    endTime: Date;
                    meetingUrl: string | null;
                    recordingUrl: string | null;
                }) | null;
            } & {
                date: Date;
                id: string;
                status: import("@prisma/client").$Enums.AttendanceStatus;
                createdAt: Date;
                updatedAt: Date;
                studentId: string;
                notes: string | null;
                subjectId: string | null;
                sessionId: string | null;
                markedBy: string | null;
            })[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getAttendanceStats(query: AttendanceStatsQueryDto, req: any): Promise<{
        status: string;
        message: string;
        data: {
            totalSessions: number;
            present: number;
            absent: number;
            late: number;
            excused: number;
            attendancePercentage: number;
        };
    }>;
    getStudentAttendanceReport(studentId: string, req: any, subjectId?: string): Promise<{
        status: string;
        message: string;
        data: unknown[];
    }>;
    getSessionAttendance(sessionId: string): Promise<{
        status: string;
        message: string;
        data: {
            session: {
                id: string;
                title: string;
                startTime: Date;
                endTime: Date;
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
            };
            attendance: {
                student: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: string;
                };
                attendance: any;
                status: any;
            }[];
            stats: {
                totalStudents: number;
                marked: number;
                unmarked: number;
            };
        };
    }>;
    getAttendanceAlerts(): Promise<{
        status: string;
        message: string;
        data: unknown;
    }>;
    getMyAttendance(query: AttendanceQueryDto, req: any): Promise<{
        status: string;
        message: string;
        data: {
            attendance: ({
                student: {
                    email: string;
                    firstName: string;
                    lastName: string;
                    id: string;
                };
                session: ({
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
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    title: string;
                    subjectId: string;
                    isActive: boolean;
                    teacherId: string;
                    startTime: Date;
                    endTime: Date;
                    meetingUrl: string | null;
                    recordingUrl: string | null;
                }) | null;
            } & {
                date: Date;
                id: string;
                status: import("@prisma/client").$Enums.AttendanceStatus;
                createdAt: Date;
                updatedAt: Date;
                studentId: string;
                notes: string | null;
                subjectId: string | null;
                sessionId: string | null;
                markedBy: string | null;
            })[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    deleteAttendance(id: string): Promise<{
        status: string;
        message: string;
    }>;
    sendAttendanceAlert(body: {
        studentId: string;
        subjectId: string;
        message?: string;
    }): Promise<{
        status: string;
        message: string;
    }>;
    triggerDailyAttendanceCheck(): Promise<{
        status: string;
        message: string;
    }>;
}
