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
exports.TimetableService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let TimetableService = class TimetableService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTimetableDto, userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { teacherSubjects: true },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        if (user.role === 'TEACHER') {
            const isTeaching = user.teacherSubjects.some(ts => ts.subjectId === createTimetableDto.subjectId && ts.isActive);
            if (!isTeaching) {
                throw new common_1.ForbiddenException('You can only create timetable for subjects you teach');
            }
        }
        else if (user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admin and teachers can create timetables');
        }
        const conflicts = await this.checkTimeConflicts(createTimetableDto);
        if (conflicts.length > 0) {
            throw new common_1.BadRequestException('Time slot conflicts with existing sessions');
        }
        return this.prisma.timetable.create({
            data: {
                subjectId: createTimetableDto.subjectId,
                dayOfWeek: createTimetableDto.dayOfWeek,
                startTime: createTimetableDto.startTime,
                endTime: createTimetableDto.endTime,
                roomNumber: createTimetableDto.roomNumber,
                isRecurring: createTimetableDto.isRecurring,
                startDate: createTimetableDto.startDate,
                endDate: createTimetableDto.endDate,
            },
            include: {
                subject: {
                    include: {
                        class: true,
                        teachers: {
                            include: {
                                teacher: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
    async findAll(userId, userRole, startDate, endDate) {
        const where = {};
        if (userRole === 'STUDENT') {
            const enrollments = await this.prisma.studentEnrollment.findMany({
                where: { studentId: userId, isActive: true },
                select: { subjectId: true },
            });
            where.subjectId = { in: enrollments.map(e => e.subjectId) };
        }
        else if (userRole === 'TEACHER') {
            const teacherSubjects = await this.prisma.teacherSubject.findMany({
                where: { teacherId: userId, isActive: true },
                select: { subjectId: true },
            });
            where.subjectId = { in: teacherSubjects.map(ts => ts.subjectId) };
        }
        if (startDate && endDate) {
            where.OR = [
                {
                    isRecurring: true,
                    startDate: { lte: endDate },
                    OR: [
                        { endDate: null },
                        { endDate: { gte: startDate } },
                    ],
                },
                {
                    isRecurring: false,
                    startDate: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            ];
        }
        return this.prisma.timetable.findMany({
            where,
            include: {
                subject: {
                    include: {
                        class: true,
                        teachers: {
                            include: {
                                teacher: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' },
            ],
        });
    }
    async findByWeek(userId, userRole, date = new Date()) {
        const weekStart = (0, date_fns_1.startOfWeek)(date, { weekStartsOn: 1 });
        const weekEnd = (0, date_fns_1.endOfWeek)(date, { weekStartsOn: 1 });
        return this.findAll(userId, userRole, weekStart, weekEnd);
    }
    async findByDay(userId, userRole, date = new Date()) {
        const dayStart = (0, date_fns_1.startOfDay)(date);
        const dayEnd = (0, date_fns_1.endOfDay)(date);
        const dayOfWeek = date.getDay();
        const where = {
            dayOfWeek,
            OR: [
                {
                    isRecurring: true,
                    startDate: { lte: dayEnd },
                    OR: [
                        { endDate: null },
                        { endDate: { gte: dayStart } },
                    ],
                },
                {
                    isRecurring: false,
                    startDate: {
                        gte: dayStart,
                        lte: dayEnd,
                    },
                },
            ],
        };
        if (userRole === 'STUDENT') {
            const enrollments = await this.prisma.studentEnrollment.findMany({
                where: { studentId: userId, isActive: true },
                select: { subjectId: true },
            });
            where.subjectId = { in: enrollments.map(e => e.subjectId) };
        }
        else if (userRole === 'TEACHER') {
            const teacherSubjects = await this.prisma.teacherSubject.findMany({
                where: { teacherId: userId, isActive: true },
                select: { subjectId: true },
            });
            where.subjectId = { in: teacherSubjects.map(ts => ts.subjectId) };
        }
        return this.prisma.timetable.findMany({
            where,
            include: {
                subject: {
                    include: {
                        class: true,
                        teachers: {
                            include: {
                                teacher: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { startTime: 'asc' },
        });
    }
    async findOne(id) {
        const timetable = await this.prisma.timetable.findUnique({
            where: { id },
            include: {
                subject: {
                    include: {
                        class: true,
                        teachers: {
                            include: {
                                teacher: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!timetable) {
            throw new common_1.NotFoundException('Timetable entry not found');
        }
        return timetable;
    }
    async update(id, updateTimetableDto, userId) {
        const timetable = await this.prisma.timetable.findUnique({
            where: { id },
            include: {
                subject: {
                    include: {
                        teachers: true,
                    },
                },
            },
        });
        if (!timetable) {
            throw new common_1.NotFoundException('Timetable entry not found');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        if (user.role === 'TEACHER') {
            const isTeaching = timetable.subject.teachers.some(ts => ts.teacherId === userId && ts.isActive);
            if (!isTeaching) {
                throw new common_1.ForbiddenException('You can only update timetable for subjects you teach');
            }
        }
        else if (user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admin and teachers can update timetables');
        }
        if (updateTimetableDto.startTime || updateTimetableDto.endTime || updateTimetableDto.dayOfWeek) {
            const conflicts = await this.checkTimeConflicts({
                ...timetable,
                ...updateTimetableDto,
            }, id);
            if (conflicts.length > 0) {
                throw new common_1.BadRequestException('Time slot conflicts with existing sessions');
            }
        }
        return this.prisma.timetable.update({
            where: { id },
            data: updateTimetableDto,
            include: {
                subject: {
                    include: {
                        class: true,
                        teachers: {
                            include: {
                                teacher: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
    async remove(id, userId) {
        const timetable = await this.prisma.timetable.findUnique({
            where: { id },
            include: {
                subject: {
                    include: {
                        teachers: true,
                    },
                },
            },
        });
        if (!timetable) {
            throw new common_1.NotFoundException('Timetable entry not found');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        if (user.role === 'TEACHER') {
            const isTeaching = timetable.subject.teachers.some(ts => ts.teacherId === userId && ts.isActive);
            if (!isTeaching) {
                throw new common_1.ForbiddenException('You can only delete timetable for subjects you teach');
            }
        }
        else if (user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admin and teachers can delete timetables');
        }
        return this.prisma.timetable.delete({
            where: { id },
        });
    }
    async checkTimeConflicts(timetableData, excludeId) {
        const where = {
            dayOfWeek: timetableData.dayOfWeek,
            subjectId: timetableData.subjectId,
        };
        if (excludeId) {
            where.id = { not: excludeId };
        }
        const existingTimetables = await this.prisma.timetable.findMany({
            where,
        });
        return existingTimetables.filter(existing => {
            const existingStart = this.timeToMinutes(existing.startTime);
            const existingEnd = this.timeToMinutes(existing.endTime);
            const newStart = this.timeToMinutes(timetableData.startTime);
            const newEnd = this.timeToMinutes(timetableData.endTime);
            return ((newStart >= existingStart && newStart < existingEnd) ||
                (newEnd > existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd));
        });
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    async getUpcomingSessions(userId, userRole, limit = 5) {
        const now = new Date();
        const currentDayOfWeek = now.getDay();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const where = {
            OR: [
                {
                    dayOfWeek: currentDayOfWeek,
                    startTime: { gt: currentTime },
                },
                {
                    dayOfWeek: { gt: currentDayOfWeek },
                },
            ],
            isRecurring: true,
        };
        if (userRole === 'STUDENT') {
            const enrollments = await this.prisma.studentEnrollment.findMany({
                where: { studentId: userId, isActive: true },
                select: { subjectId: true },
            });
            where.subjectId = { in: enrollments.map(e => e.subjectId) };
        }
        else if (userRole === 'TEACHER') {
            const teacherSubjects = await this.prisma.teacherSubject.findMany({
                where: { teacherId: userId, isActive: true },
                select: { subjectId: true },
            });
            where.subjectId = { in: teacherSubjects.map(ts => ts.subjectId) };
        }
        return this.prisma.timetable.findMany({
            where,
            include: {
                subject: {
                    include: {
                        class: true,
                        teachers: {
                            include: {
                                teacher: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' },
            ],
            take: limit,
        });
    }
};
exports.TimetableService = TimetableService;
exports.TimetableService = TimetableService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TimetableService);
//# sourceMappingURL=timetable.service.js.map