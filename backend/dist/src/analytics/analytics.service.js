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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(userId, userRole) {
        const stats = {};
        if (userRole === 'ADMIN') {
            stats.totalUsers = await this.prisma.user.count();
            stats.totalStudents = await this.prisma.user.count({ where: { role: 'STUDENT' } });
            stats.totalTeachers = await this.prisma.user.count({ where: { role: 'TEACHER' } });
            stats.totalClasses = await this.prisma.class.count({ where: { isActive: true } });
            stats.totalSubjects = await this.prisma.subject.count({ where: { isActive: true } });
            stats.totalEnrollments = await this.prisma.studentEnrollment.count({ where: { isActive: true } });
            stats.pendingApprovals = await this.prisma.user.count({ where: { status: 'PENDING' } });
            stats.pendingPayments = await this.prisma.payment.count({ where: { status: 'PENDING' } });
            const revenue = await this.prisma.payment.aggregate({
                where: { status: 'APPROVED' },
                _sum: { amount: true },
            });
            stats.totalRevenue = revenue._sum.amount || 0;
            const monthStart = (0, date_fns_1.startOfMonth)(new Date());
            const monthEnd = (0, date_fns_1.endOfMonth)(new Date());
            const monthlyRevenue = await this.prisma.payment.aggregate({
                where: {
                    status: 'APPROVED',
                    createdAt: { gte: monthStart, lte: monthEnd },
                },
                _sum: { amount: true },
            });
            stats.monthlyRevenue = monthlyRevenue._sum.amount || 0;
            const pendingUsers = await this.prisma.user.findMany({
                where: { status: 'PENDING' },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    createdAt: true,
                },
            });
            stats.pendingApprovals = pendingUsers.map(user => ({
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                type: user.role === 'TEACHER' ? 'Teacher' : 'Student',
                date: user.createdAt.toISOString().split('T')[0],
                documents: Math.floor(Math.random() * 3) + 2,
                status: 'pending',
            }));
            const pendingPaymentsList = await this.prisma.payment.findMany({
                where: { status: 'PENDING' },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    student: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });
            stats.pendingPayments = pendingPaymentsList.map(payment => ({
                id: payment.id,
                student: `${payment.student.firstName} ${payment.student.lastName}`,
                class: 'Grade ' + (Math.floor(Math.random() * 4) + 9),
                amount: Number(payment.amount),
                dueDate: payment.createdAt.toISOString().split('T')[0],
                status: 'pending',
            }));
        }
        else if (userRole === 'TEACHER') {
            const teacherSubjects = await this.prisma.teacherSubject.findMany({
                where: { teacherId: userId, isActive: true },
                include: {
                    subject: {
                        include: {
                            enrollments: { where: { isActive: true } },
                            assignments: true,
                            tests: true,
                            materials: true,
                        },
                    },
                },
            });
            stats.totalSubjects = teacherSubjects.length;
            stats.totalStudents = teacherSubjects.reduce((sum, ts) => sum + ts.subject.enrollments.length, 0);
            stats.totalAssignments = teacherSubjects.reduce((sum, ts) => sum + ts.subject.assignments.length, 0);
            stats.totalTests = teacherSubjects.reduce((sum, ts) => sum + ts.subject.tests.length, 0);
            stats.totalMaterials = teacherSubjects.reduce((sum, ts) => sum + ts.subject.materials.length, 0);
            const today = new Date().getDay();
            stats.todaysClasses = await this.prisma.timetable.count({
                where: {
                    subjectId: { in: teacherSubjects.map(ts => ts.subjectId) },
                    dayOfWeek: today,
                },
            });
            stats.pendingGrading = await this.prisma.studentAssignment.count({
                where: {
                    assignment: {
                        teacherId: userId,
                    },
                    submittedAt: { not: null },
                    gradedAt: null,
                },
            });
        }
        else if (userRole === 'STUDENT') {
            const enrollments = await this.prisma.studentEnrollment.findMany({
                where: { studentId: userId, isActive: true },
                include: {
                    subject: {
                        include: {
                            assignments: true,
                            tests: true,
                            materials: true,
                        },
                    },
                },
            });
            stats.totalSubjects = enrollments.length;
            stats.totalAssignments = enrollments.reduce((sum, e) => sum + e.subject.assignments.length, 0);
            stats.totalTests = enrollments.reduce((sum, e) => sum + e.subject.tests.length, 0);
            stats.totalMaterials = enrollments.reduce((sum, e) => sum + e.subject.materials.length, 0);
            const assignments = await this.prisma.studentAssignment.findMany({
                where: { studentId: userId },
            });
            stats.submittedAssignments = assignments.filter(a => a.submittedAt).length;
            stats.pendingAssignments = assignments.filter(a => !a.submittedAt).length;
            stats.gradedAssignments = assignments.filter(a => a.gradedAt).length;
            const attendance = await this.prisma.attendance.findMany({
                where: { studentId: userId },
            });
            const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
            stats.attendanceRate = attendance.length > 0
                ? Math.round((presentCount / attendance.length) * 100)
                : 0;
            const gradedAssignmentsWithMarks = assignments.filter(a => a.marksObtained !== null);
            if (gradedAssignmentsWithMarks.length > 0) {
                const totalMarks = gradedAssignmentsWithMarks.reduce((sum, a) => sum + (a.marksObtained || 0), 0);
                stats.averageMarks = Math.round(totalMarks / gradedAssignmentsWithMarks.length);
            }
            else {
                stats.averageMarks = 0;
            }
        }
        return stats;
    }
    async getStudentPerformance(studentId, subjectId) {
        const where = { studentId };
        if (subjectId) {
            where.assignment = { subjectId };
        }
        const assignments = await this.prisma.studentAssignment.findMany({
            where,
            include: {
                assignment: {
                    include: {
                        subject: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const tests = await this.prisma.studentTest.findMany({
            where: subjectId ? { studentId, test: { subjectId } } : { studentId },
            include: {
                test: {
                    include: {
                        subject: true,
                    },
                },
            },
            orderBy: { attemptedAt: 'desc' },
        });
        const attendance = await this.prisma.attendance.findMany({
            where: subjectId ? { studentId, subject: { id: subjectId } } : { studentId },
            include: {
                subject: true,
            },
            orderBy: { date: 'desc' },
        });
        const assignmentStats = this.calculateAssignmentStats(assignments);
        const testStats = this.calculateTestStats(tests);
        const attendanceStats = this.calculateAttendanceStats(attendance);
        return {
            assignments: assignmentStats,
            tests: testStats,
            attendance: attendanceStats,
            recentAssignments: assignments.slice(0, 5),
            recentTests: tests.slice(0, 5),
        };
    }
    async getClassPerformance(classId) {
        const subjects = await this.prisma.subject.findMany({
            where: { classId },
            include: {
                enrollments: {
                    include: {
                        student: true,
                    },
                },
                assignments: {
                    include: {
                        submissions: true,
                    },
                },
                tests: {
                    include: {
                        attempts: true,
                    },
                },
            },
        });
        const classStats = subjects.map(subject => {
            const totalStudents = subject.enrollments.length;
            const totalAssignments = subject.assignments.length;
            const totalTests = subject.tests.length;
            const assignmentCompletions = subject.assignments.reduce((sum, assignment) => {
                return sum + assignment.submissions.filter(s => s.submittedAt).length;
            }, 0);
            const assignmentCompletionRate = totalAssignments > 0 && totalStudents > 0
                ? Math.round((assignmentCompletions / (totalAssignments * totalStudents)) * 100)
                : 0;
            const testCompletions = subject.tests.reduce((sum, test) => {
                return sum + test.attempts.length;
            }, 0);
            const testCompletionRate = totalTests > 0 && totalStudents > 0
                ? Math.round((testCompletions / (totalTests * totalStudents)) * 100)
                : 0;
            const allMarks = [
                ...subject.assignments.flatMap(a => a.submissions.map(s => s.marksObtained).filter(m => m !== null)),
                ...subject.tests.flatMap(t => t.attempts.map(a => a.marksObtained).filter(m => m !== null)),
            ];
            const averageMarks = allMarks.length > 0
                ? Math.round(allMarks.reduce((sum, mark) => sum + mark, 0) / allMarks.length)
                : 0;
            return {
                subjectId: subject.id,
                subjectName: subject.name,
                totalStudents,
                totalAssignments,
                totalTests,
                assignmentCompletionRate,
                testCompletionRate,
                averageMarks,
            };
        });
        return classStats;
    }
    async getRevenueAnalytics(startDate, endDate) {
        const dateFilter = startDate && endDate
            ? { createdAt: { gte: startDate, lte: endDate } }
            : {};
        const totalRevenue = await this.prisma.payment.aggregate({
            where: { status: 'APPROVED', ...dateFilter },
            _sum: { amount: true },
        });
        const revenueByType = await this.prisma.payment.groupBy({
            by: ['type'],
            where: { status: 'APPROVED', ...dateFilter },
            _sum: { amount: true },
            _count: true,
        });
        const revenueByMethod = await this.prisma.payment.groupBy({
            by: ['paymentMethod'],
            where: { status: 'APPROVED', ...dateFilter },
            _sum: { amount: true },
            _count: true,
        });
        const monthlyRevenue = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(new Date(), i));
            const monthEnd = (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(new Date(), i));
            const revenue = await this.prisma.payment.aggregate({
                where: {
                    status: 'APPROVED',
                    createdAt: { gte: monthStart, lte: monthEnd },
                },
                _sum: { amount: true },
            });
            monthlyRevenue.push({
                month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
                revenue: revenue._sum.amount || 0,
            });
        }
        const pendingPayments = await this.prisma.payment.aggregate({
            where: { status: 'PENDING', ...dateFilter },
            _sum: { amount: true },
            _count: true,
        });
        return {
            totalRevenue: totalRevenue._sum.amount || 0,
            revenueByType,
            revenueByMethod,
            monthlyRevenue,
            pendingAmount: pendingPayments._sum.amount || 0,
            pendingCount: pendingPayments._count || 0,
        };
    }
    async getAttendanceAnalytics(subjectId, startDate, endDate) {
        const where = {};
        if (subjectId)
            where.subjectId = subjectId;
        if (startDate && endDate) {
            where.date = { gte: startDate, lte: endDate };
        }
        const attendance = await this.prisma.attendance.groupBy({
            by: ['status'],
            where,
            _count: true,
        });
        const attendanceBySubject = await this.prisma.attendance.groupBy({
            by: ['subjectId', 'status'],
            where,
            _count: true,
        });
        const subjectIds = [...new Set(attendanceBySubject.map(a => a.subjectId).filter(id => id !== null))];
        const subjects = await this.prisma.subject.findMany({
            where: { id: { in: subjectIds } },
            select: { id: true, name: true },
        });
        const subjectMap = subjects.reduce((acc, s) => {
            acc[s.id] = s.name;
            return acc;
        }, {});
        const attendanceBySubjectFormatted = attendanceBySubject.map(a => ({
            subjectName: a.subjectId ? subjectMap[a.subjectId] : 'Unknown',
            status: a.status,
            count: a._count,
        }));
        const totalRecords = attendance.reduce((sum, a) => sum + a._count, 0);
        const presentCount = attendance.find(a => a.status === 'PRESENT')?._count || 0;
        const attendanceRate = totalRecords > 0
            ? Math.round((presentCount / totalRecords) * 100)
            : 0;
        return {
            overall: attendance,
            bySubject: attendanceBySubjectFormatted,
            attendanceRate,
            totalRecords,
        };
    }
    calculateAssignmentStats(assignments) {
        const total = assignments.length;
        const submitted = assignments.filter(a => a.submittedAt).length;
        const graded = assignments.filter(a => a.gradedAt).length;
        const pending = total - submitted;
        const gradedWithMarks = assignments.filter(a => a.marksObtained !== null);
        const averageMarks = gradedWithMarks.length > 0
            ? Math.round(gradedWithMarks.reduce((sum, a) => sum + a.marksObtained, 0) / gradedWithMarks.length)
            : 0;
        return {
            total,
            submitted,
            graded,
            pending,
            averageMarks,
            submissionRate: total > 0 ? Math.round((submitted / total) * 100) : 0,
        };
    }
    calculateTestStats(tests) {
        const total = tests.length;
        const completed = tests.filter(t => t.isCompleted).length;
        const passed = tests.filter(t => t.isPassed).length;
        const averageMarks = total > 0
            ? Math.round(tests.reduce((sum, t) => sum + (t.marksObtained || 0), 0) / total)
            : 0;
        return {
            total,
            completed,
            passed,
            averageMarks,
            passRate: completed > 0 ? Math.round((passed / completed) * 100) : 0,
        };
    }
    calculateAttendanceStats(attendance) {
        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'PRESENT').length;
        const absent = attendance.filter(a => a.status === 'ABSENT').length;
        const late = attendance.filter(a => a.status === 'LATE').length;
        const excused = attendance.filter(a => a.status === 'EXCUSED').length;
        return {
            total,
            present,
            absent,
            late,
            excused,
            attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
        };
    }
    async getTeacherAnalytics(teacherId) {
        const teacherSubjects = await this.prisma.teacherSubject.findMany({
            where: { teacherId, isActive: true },
            include: {
                subject: {
                    include: {
                        enrollments: { where: { isActive: true } },
                        assignments: {
                            include: {
                                submissions: true,
                            },
                        },
                        tests: {
                            include: {
                                attempts: true,
                            },
                        },
                        materials: true,
                    },
                },
            },
        });
        const analytics = teacherSubjects.map(ts => {
            const subject = ts.subject;
            const totalStudents = subject.enrollments.length;
            const assignmentStats = subject.assignments.map(assignment => {
                const submissions = assignment.submissions.length;
                const graded = assignment.submissions.filter(s => s.gradedAt).length;
                const averageMarks = assignment.submissions
                    .filter(s => s.marksObtained !== null)
                    .reduce((sum, s) => sum + (s.marksObtained || 0), 0) / (graded || 1);
                return {
                    title: assignment.title,
                    totalMarks: assignment.totalMarks,
                    submissions,
                    graded,
                    averageMarks: Math.round(averageMarks),
                    submissionRate: totalStudents > 0 ? Math.round((submissions / totalStudents) * 100) : 0,
                };
            });
            const testStats = subject.tests.map(test => {
                const attempts = test.attempts.length;
                const passed = test.attempts.filter(a => a.isPassed).length;
                const averageMarks = test.attempts
                    .reduce((sum, a) => sum + (a.marksObtained || 0), 0) / (attempts || 1);
                return {
                    title: test.title,
                    totalMarks: test.totalMarks,
                    attempts,
                    passed,
                    averageMarks: Math.round(averageMarks),
                    passRate: attempts > 0 ? Math.round((passed / attempts) * 100) : 0,
                };
            });
            return {
                subjectId: subject.id,
                subjectName: subject.name,
                totalStudents,
                totalAssignments: subject.assignments.length,
                totalTests: subject.tests.length,
                totalMaterials: subject.materials.length,
                assignments: assignmentStats,
                tests: testStats,
            };
        });
        return analytics;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map