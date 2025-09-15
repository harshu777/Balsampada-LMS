"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AttendanceSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const attendance_service_1 = require("./attendance.service");
const notifications_service_1 = require("../notifications/notifications.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AttendanceSchedulerService = AttendanceSchedulerService_1 = class AttendanceSchedulerService {
    attendanceService;
    notificationsService;
    prisma;
    logger = new common_1.Logger(AttendanceSchedulerService_1.name);
    constructor(attendanceService, notificationsService, prisma) {
        this.attendanceService = attendanceService;
        this.notificationsService = notificationsService;
        this.prisma = prisma;
    }
    async checkLowAttendanceDaily() {
        this.logger.log('Running daily low attendance check...');
        try {
            const lowAttendanceStudents = await this.attendanceService.getAttendanceAlerts();
            if (lowAttendanceStudents.length > 0) {
                this.logger.log(`Found ${lowAttendanceStudents.length} students with low attendance`);
                for (const student of lowAttendanceStudents) {
                    await this.notificationsService.createNotification({
                        userId: student.id,
                        type: client_1.NotificationType.CLASS,
                        title: 'Low Attendance Alert',
                        message: `Your attendance in ${student.subjectName} is ${student.attendancePercentage}%. Please attend classes regularly to maintain good academic standing.`,
                        data: {
                            subjectId: student.subjectId,
                            subjectName: student.subjectName,
                            attendancePercentage: student.attendancePercentage,
                            totalSessions: student.totalSessions,
                            attendedSessions: student.attendedSessions,
                            alertType: 'low_attendance'
                        }
                    });
                }
                const criticalAttendanceStudents = lowAttendanceStudents.filter((student) => student.attendancePercentage < 60);
                if (criticalAttendanceStudents.length > 0) {
                    const adminUsers = await this.prisma.user.findMany({
                        where: { role: 'ADMIN' },
                        select: { id: true }
                    });
                    const adminNotifications = adminUsers.map(admin => ({
                        userId: admin.id,
                        type: client_1.NotificationType.SYSTEM,
                        title: 'Critical Attendance Alert',
                        message: `${criticalAttendanceStudents.length} student(s) have critically low attendance (< 60%). Immediate attention required.`,
                        data: {
                            criticalCount: criticalAttendanceStudents.length,
                            students: criticalAttendanceStudents.map((s) => ({
                                id: s.id,
                                name: `${s.firstName} ${s.lastName}`,
                                subject: s.subjectName,
                                percentage: s.attendancePercentage
                            })),
                            alertType: 'critical_attendance_admin'
                        }
                    }));
                    await this.notificationsService.createBulkNotifications(adminNotifications);
                }
            }
        }
        catch (error) {
            this.logger.error('Error in daily low attendance check:', error);
        }
    }
    async sendWeeklyAttendanceSummary() {
        this.logger.log('Sending weekly attendance summary...');
        try {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const students = await this.prisma.user.findMany({
                where: { role: 'STUDENT' },
                include: {
                    studentEnrollments: {
                        where: { isActive: true },
                        include: {
                            subject: {
                                include: { class: true }
                            }
                        }
                    }
                }
            });
            for (const student of students) {
                for (const enrollment of student.studentEnrollments) {
                    const stats = await this.attendanceService.getAttendanceStats({
                        studentId: student.id,
                        subjectId: enrollment.subjectId,
                        startDate: weekAgo.toISOString()
                    });
                    if (stats.totalSessions > 0) {
                        await this.notificationsService.createNotification({
                            userId: student.id,
                            type: client_1.NotificationType.CLASS,
                            title: 'Weekly Attendance Summary',
                            message: `Your attendance this week in ${enrollment.subject.name}: ${stats.attendancePercentage}% (${stats.present + stats.late}/${stats.totalSessions} classes)`,
                            data: {
                                subjectId: enrollment.subjectId,
                                subjectName: enrollment.subject.name,
                                weeklyStats: stats,
                                period: 'weekly',
                                alertType: 'weekly_summary'
                            }
                        });
                    }
                }
            }
        }
        catch (error) {
            this.logger.error('Error sending weekly attendance summary:', error);
        }
    }
    async checkMissedSessions() {
        this.logger.log('Checking for missed sessions...');
        try {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const sessionsWithIncompleteAttendance = await this.prisma.liveSession.findMany({
                where: {
                    endTime: {
                        gte: oneHourAgo,
                        lte: now
                    }
                },
                include: {
                    subject: {
                        include: {
                            enrollments: {
                                where: { isActive: true },
                                include: { student: true }
                            }
                        }
                    },
                    attendance: true,
                    teacher: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });
            for (const session of sessionsWithIncompleteAttendance) {
                const enrolledStudents = session.subject.enrollments.map(e => e.student);
                const markedAttendance = session.attendance.map(a => a.studentId);
                const unmarkedStudents = enrolledStudents.filter(student => !markedAttendance.includes(student.id));
                if (unmarkedStudents.length > 0) {
                    await this.notificationsService.createNotification({
                        userId: session.teacherId,
                        type: client_1.NotificationType.CLASS,
                        title: 'Attendance Reminder',
                        message: `Please mark attendance for "${session.title}". ${unmarkedStudents.length} student(s) attendance is pending.`,
                        data: {
                            sessionId: session.id,
                            sessionTitle: session.title,
                            unmarkedCount: unmarkedStudents.length,
                            unmarkedStudents: unmarkedStudents.map(s => ({
                                id: s.id,
                                name: `${s.firstName} ${s.lastName}`
                            })),
                            alertType: 'unmarked_attendance_reminder'
                        }
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Error checking missed sessions:', error);
        }
    }
    async sendMonthlyAttendanceReport() {
        this.logger.log('Sending monthly attendance reports...');
        try {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            lastMonth.setDate(1);
            const thisMonth = new Date();
            thisMonth.setDate(1);
            const students = await this.prisma.user.findMany({
                where: { role: 'STUDENT' },
                include: {
                    studentEnrollments: {
                        where: { isActive: true },
                        include: {
                            subject: {
                                include: { class: true }
                            }
                        }
                    }
                }
            });
            for (const student of students) {
                let totalSessions = 0;
                let totalPresent = 0;
                const subjectStats = [];
                for (const enrollment of student.studentEnrollments) {
                    const stats = await this.attendanceService.getAttendanceStats({
                        studentId: student.id,
                        subjectId: enrollment.subjectId,
                        startDate: lastMonth.toISOString(),
                        endDate: thisMonth.toISOString()
                    });
                    if (stats.totalSessions > 0) {
                        totalSessions += stats.totalSessions;
                        totalPresent += stats.present + stats.late;
                        subjectStats.push({
                            subjectName: enrollment.subject.name,
                            className: enrollment.subject.class.name,
                            stats
                        });
                    }
                }
                if (totalSessions > 0) {
                    const overallPercentage = Math.round((totalPresent / totalSessions) * 100);
                    await this.notificationsService.createNotification({
                        userId: student.id,
                        type: client_1.NotificationType.CLASS,
                        title: 'Monthly Attendance Report',
                        message: `Your overall attendance for last month: ${overallPercentage}% (${totalPresent}/${totalSessions} classes)`,
                        data: {
                            overallPercentage,
                            totalSessions,
                            totalPresent,
                            subjectStats,
                            period: 'monthly',
                            month: lastMonth.getMonth() + 1,
                            year: lastMonth.getFullYear(),
                            alertType: 'monthly_report'
                        }
                    });
                }
            }
            const adminUsers = await this.prisma.user.findMany({
                where: { role: 'ADMIN' },
                select: { id: true }
            });
            const overallStats = await this.attendanceService.getAttendanceStats({
                startDate: lastMonth.toISOString(),
                endDate: thisMonth.toISOString()
            });
            const adminNotifications = adminUsers.map(admin => ({
                userId: admin.id,
                type: client_1.NotificationType.SYSTEM,
                title: 'Monthly Attendance Report - Admin Summary',
                message: `System-wide attendance for last month: ${overallStats.attendancePercentage}% (${overallStats.present + overallStats.late}/${overallStats.totalSessions} sessions)`,
                data: {
                    overallStats,
                    period: 'monthly',
                    month: lastMonth.getMonth() + 1,
                    year: lastMonth.getFullYear(),
                    alertType: 'monthly_admin_summary'
                }
            }));
            await this.notificationsService.createBulkNotifications(adminNotifications);
        }
        catch (error) {
            this.logger.error('Error sending monthly attendance reports:', error);
        }
    }
    async sendAttendanceAlert(studentId, subjectId, customMessage) {
        try {
            const student = await this.prisma.user.findUnique({
                where: { id: studentId }
            });
            const subject = await this.prisma.subject.findUnique({
                where: { id: subjectId },
                include: { class: true }
            });
            if (!student || !subject) {
                throw new Error('Student or subject not found');
            }
            const stats = await this.attendanceService.getAttendanceStats({
                studentId,
                subjectId
            });
            const message = customMessage ||
                `Your attendance in ${subject.name} is ${stats.attendancePercentage}%. Please attend classes regularly.`;
            await this.notificationsService.createNotification({
                userId: studentId,
                type: client_1.NotificationType.CLASS,
                title: 'Attendance Alert',
                message,
                data: {
                    subjectId,
                    subjectName: subject.name,
                    className: subject.class.name,
                    stats,
                    alertType: 'manual_alert'
                }
            });
            this.logger.log(`Sent manual attendance alert to student ${studentId} for subject ${subjectId}`);
        }
        catch (error) {
            this.logger.error('Error sending manual attendance alert:', error);
            throw error;
        }
    }
    async sendParentNotifications(studentId, attendancePercentage) {
        try {
            if (attendancePercentage < 75) {
                await this.notificationsService.createNotification({
                    userId: studentId,
                    type: client_1.NotificationType.SYSTEM,
                    title: 'Parent Notification Sent',
                    message: `Due to low attendance (${attendancePercentage}%), your parents have been notified. Please discuss this with them and ensure regular attendance.`,
                    data: {
                        attendancePercentage,
                        alertType: 'parent_notification',
                        notificationSent: true
                    }
                });
            }
        }
        catch (error) {
            this.logger.error('Error sending parent notifications:', error);
        }
    }
};
exports.AttendanceSchedulerService = AttendanceSchedulerService;
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceSchedulerService.prototype, "checkLowAttendanceDaily", null);
__decorate([
    (0, schedule_1.Cron)('0 9 * * 1'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceSchedulerService.prototype, "sendWeeklyAttendanceSummary", null);
__decorate([
    (0, schedule_1.Cron)('0 9-17 * * 1-6'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceSchedulerService.prototype, "checkMissedSessions", null);
__decorate([
    (0, schedule_1.Cron)('0 10 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceSchedulerService.prototype, "sendMonthlyAttendanceReport", null);
exports.AttendanceSchedulerService = AttendanceSchedulerService = AttendanceSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService,
        notifications_service_1.NotificationsService,
        prisma_service_1.PrismaService])
], AttendanceSchedulerService);
//# sourceMappingURL=attendance-scheduler.service.js.map