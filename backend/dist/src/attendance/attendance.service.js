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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
let AttendanceService = class AttendanceService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async markAttendance(markAttendanceDto, markedBy) {
        const { sessionId, studentId, status, notes } = markAttendanceDto;
        const session = await this.prisma.liveSession.findUnique({
            where: { id: sessionId },
            include: {
                subject: {
                    include: {
                        class: true
                    }
                }
            }
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const enrollment = await this.prisma.studentEnrollment.findFirst({
            where: {
                studentId,
                subjectId: session.subjectId,
                isActive: true
            }
        });
        if (!enrollment) {
            throw new common_1.BadRequestException('Student is not enrolled in this subject');
        }
        const existingAttendance = await this.prisma.attendance.findUnique({
            where: {
                studentId_sessionId: {
                    studentId,
                    sessionId
                }
            }
        });
        if (existingAttendance) {
            const updatedAttendance = await this.prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                    status,
                    notes,
                    markedBy,
                    updatedAt: new Date()
                },
                include: {
                    student: true,
                    session: {
                        include: {
                            subject: {
                                include: {
                                    class: true
                                }
                            }
                        }
                    }
                }
            });
            return updatedAttendance;
        }
        const attendance = await this.prisma.attendance.create({
            data: {
                studentId,
                sessionId,
                status,
                notes,
                markedBy
            },
            include: {
                student: true,
                session: {
                    include: {
                        subject: {
                            include: {
                                class: true
                            }
                        }
                    }
                }
            }
        });
        if (status === client_1.AttendanceStatus.ABSENT) {
            await this.notificationsService.createNotification({
                userId: studentId,
                type: client_1.NotificationType.CLASS,
                title: 'Absence Notification',
                message: `You were marked absent for ${session.title} (${session.subject.name})`,
                data: {
                    sessionId,
                    attendanceId: attendance.id,
                    subjectName: session.subject.name,
                    className: session.subject.class.name
                }
            });
        }
        return attendance;
    }
    async bulkMarkAttendance(bulkMarkAttendanceDto, markedBy) {
        const { sessionId, attendanceData } = bulkMarkAttendanceDto;
        const session = await this.prisma.liveSession.findUnique({
            where: { id: sessionId },
            include: {
                subject: {
                    include: {
                        class: true
                    }
                }
            }
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const results = [];
        for (const data of attendanceData) {
            try {
                const attendance = await this.markAttendance({
                    sessionId,
                    studentId: data.studentId,
                    status: data.status,
                    notes: data.notes
                }, markedBy);
                results.push({ success: true, attendance });
            }
            catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    studentId: data.studentId
                });
            }
        }
        return results;
    }
    async updateAttendance(attendanceId, updateAttendanceDto) {
        const attendance = await this.prisma.attendance.findUnique({
            where: { id: attendanceId }
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance record not found');
        }
        return await this.prisma.attendance.update({
            where: { id: attendanceId },
            data: updateAttendanceDto,
            include: {
                student: true,
                session: {
                    include: {
                        subject: {
                            include: {
                                class: true
                            }
                        }
                    }
                }
            }
        });
    }
    async getAttendance(query) {
        const { studentId, subjectId, sessionId, status, startDate, endDate, page = 1, limit = 10 } = query;
        const where = {};
        if (studentId)
            where.studentId = studentId;
        if (sessionId)
            where.sessionId = sessionId;
        if (status)
            where.status = status;
        if (subjectId) {
            where.session = {
                subjectId
            };
        }
        if (startDate || endDate) {
            where.session = {
                ...where.session,
                startTime: {}
            };
            if (startDate)
                where.session.startTime.gte = new Date(startDate);
            if (endDate)
                where.session.startTime.lte = new Date(endDate);
        }
        const skip = (page - 1) * limit;
        const [attendance, total] = await Promise.all([
            this.prisma.attendance.findMany({
                where,
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    session: {
                        include: {
                            subject: {
                                include: {
                                    class: true
                                }
                            }
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prisma.attendance.count({ where })
        ]);
        return {
            attendance,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getAttendanceStats(query) {
        const { studentId, subjectId, classId, startDate, endDate, period } = query;
        const where = {};
        if (studentId)
            where.studentId = studentId;
        if (subjectId || classId) {
            where.session = {};
            if (subjectId)
                where.session.subjectId = subjectId;
            if (classId)
                where.session.subject = { classId };
        }
        if (startDate || endDate) {
            if (!where.session)
                where.session = {};
            where.session.startTime = {};
            if (startDate)
                where.session.startTime.gte = new Date(startDate);
            if (endDate)
                where.session.startTime.lte = new Date(endDate);
        }
        const totalSessions = await this.prisma.attendance.count({ where });
        const attendanceByStatus = await this.prisma.attendance.groupBy({
            by: ['status'],
            where,
            _count: {
                status: true
            }
        });
        const stats = {
            totalSessions,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            attendancePercentage: 0
        };
        attendanceByStatus.forEach(item => {
            switch (item.status) {
                case client_1.AttendanceStatus.PRESENT:
                    stats.present = item._count.status;
                    break;
                case client_1.AttendanceStatus.ABSENT:
                    stats.absent = item._count.status;
                    break;
                case client_1.AttendanceStatus.LATE:
                    stats.late = item._count.status;
                    break;
                case client_1.AttendanceStatus.EXCUSED:
                    stats.excused = item._count.status;
                    break;
            }
        });
        if (totalSessions > 0) {
            stats.attendancePercentage = Math.round(((stats.present + stats.late) / totalSessions) * 100);
        }
        return stats;
    }
    async getStudentAttendanceReport(studentId, subjectId) {
        const where = {
            studentId
        };
        if (subjectId) {
            where.session = {
                subjectId
            };
        }
        const attendance = await this.prisma.attendance.findMany({
            where,
            include: {
                session: {
                    include: {
                        subject: {
                            include: {
                                class: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                session: {
                    startTime: 'desc'
                }
            }
        });
        const reportBySubject = {};
        attendance.forEach(record => {
            const subjectKey = record.session?.subject?.id;
            if (!subjectKey)
                return;
            if (!reportBySubject[subjectKey]) {
                reportBySubject[subjectKey] = {
                    subject: record.session?.subject,
                    totalSessions: 0,
                    present: 0,
                    absent: 0,
                    late: 0,
                    excused: 0,
                    attendancePercentage: 0,
                    sessions: []
                };
            }
            const subjectData = reportBySubject[subjectKey];
            subjectData.totalSessions++;
            subjectData.sessions.push(record);
            switch (record.status) {
                case client_1.AttendanceStatus.PRESENT:
                    subjectData.present++;
                    break;
                case client_1.AttendanceStatus.ABSENT:
                    subjectData.absent++;
                    break;
                case client_1.AttendanceStatus.LATE:
                    subjectData.late++;
                    break;
                case client_1.AttendanceStatus.EXCUSED:
                    subjectData.excused++;
                    break;
            }
            subjectData.attendancePercentage = Math.round(((subjectData.present + subjectData.late) / subjectData.totalSessions) * 100);
        });
        return Object.values(reportBySubject);
    }
    async getSessionAttendance(sessionId) {
        const session = await this.prisma.liveSession.findUnique({
            where: { id: sessionId },
            include: {
                subject: {
                    include: {
                        class: true,
                        enrollments: {
                            where: { isActive: true },
                            include: {
                                student: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                },
                attendance: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        if (!session) {
            throw new common_1.NotFoundException('Session not found');
        }
        const enrolledStudents = session.subject.enrollments.map(enrollment => enrollment.student);
        const attendanceMap = new Map();
        session.attendance.forEach(record => {
            attendanceMap.set(record.studentId, record);
        });
        const completeAttendance = enrolledStudents.map(student => {
            const attendanceRecord = attendanceMap.get(student.id);
            return {
                student,
                attendance: attendanceRecord || null,
                status: attendanceRecord?.status || null
            };
        });
        return {
            session: {
                id: session.id,
                title: session.title,
                startTime: session.startTime,
                endTime: session.endTime,
                subject: session.subject
            },
            attendance: completeAttendance,
            stats: {
                totalStudents: enrolledStudents.length,
                marked: session.attendance.length,
                unmarked: enrolledStudents.length - session.attendance.length
            }
        };
    }
    async deleteAttendance(attendanceId) {
        const attendance = await this.prisma.attendance.findUnique({
            where: { id: attendanceId }
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance record not found');
        }
        return await this.prisma.attendance.delete({
            where: { id: attendanceId }
        });
    }
    async getAttendanceAlerts() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const lowAttendanceStudents = await this.prisma.$queryRaw `
      SELECT 
        u.id,
        u."firstName",
        u."lastName",
        u.email,
        s.id as "subjectId",
        s.name as "subjectName",
        c.name as "className",
        COUNT(a.id) as "totalSessions",
        COUNT(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 END) as "attendedSessions",
        ROUND(
          (COUNT(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 END)::decimal / COUNT(a.id)::decimal) * 100, 2
        ) as "attendancePercentage"
      FROM "User" u
      JOIN "StudentEnrollment" se ON u.id = se."studentId"
      JOIN "Subject" s ON se."subjectId" = s.id
      JOIN "Class" c ON s."classId" = c.id
      JOIN "LiveSession" ls ON s.id = ls."subjectId"
      JOIN "Attendance" a ON ls.id = a."sessionId" AND u.id = a."studentId"
      WHERE 
        u.role = 'STUDENT' 
        AND se."isActive" = true
        AND ls."startTime" >= ${thirtyDaysAgo}
      GROUP BY u.id, u."firstName", u."lastName", u.email, s.id, s.name, c.name
      HAVING 
        COUNT(a.id) >= 5 
        AND ROUND(
          (COUNT(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 END)::decimal / COUNT(a.id)::decimal) * 100, 2
        ) < 75
      ORDER BY "attendancePercentage" ASC
    `;
        return lowAttendanceStudents;
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map