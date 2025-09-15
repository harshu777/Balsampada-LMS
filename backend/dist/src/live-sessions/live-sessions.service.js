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
exports.LiveSessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let LiveSessionsService = class LiveSessionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createLiveSessionDto, teacherId) {
        const teacherSubject = await this.prisma.teacherSubject.findFirst({
            where: {
                teacherId,
                subjectId: createLiveSessionDto.subjectId,
                isActive: true,
            },
        });
        if (!teacherSubject) {
            throw new common_1.ForbiddenException('You are not assigned to teach this subject');
        }
        return this.prisma.liveSession.create({
            data: {
                ...createLiveSessionDto,
                teacherId,
                startTime: new Date(createLiveSessionDto.startTime),
                endTime: new Date(createLiveSessionDto.endTime),
            },
            include: {
                subject: {
                    include: {
                        class: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findAll(userId, userRole) {
        const where = { isActive: true };
        if (userRole === client_1.Role.TEACHER) {
            where.teacherId = userId;
        }
        else if (userRole === client_1.Role.STUDENT) {
            const enrollments = await this.prisma.studentEnrollment.findMany({
                where: {
                    studentId: userId,
                    isActive: true,
                },
                select: {
                    subjectId: true,
                },
            });
            const subjectIds = enrollments.map(e => e.subjectId);
            where.subjectId = { in: subjectIds };
        }
        return this.prisma.liveSession.findMany({
            where,
            include: {
                subject: {
                    include: {
                        class: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        attendees: true,
                    },
                },
            },
            orderBy: {
                startTime: 'asc',
            },
        });
    }
    async findOne(id) {
        const session = await this.prisma.liveSession.findUnique({
            where: { id },
            include: {
                subject: {
                    include: {
                        class: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                attendees: {
                    include: {
                        user: {
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
        });
        if (!session) {
            throw new common_1.NotFoundException('Live session not found');
        }
        return session;
    }
    async update(id, updateLiveSessionDto, teacherId) {
        const session = await this.prisma.liveSession.findUnique({
            where: { id },
        });
        if (!session) {
            throw new common_1.NotFoundException('Live session not found');
        }
        if (session.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You can only update your own sessions');
        }
        const updateData = { ...updateLiveSessionDto };
        if (updateLiveSessionDto.startTime) {
            updateData.startTime = new Date(updateLiveSessionDto.startTime);
        }
        if (updateLiveSessionDto.endTime) {
            updateData.endTime = new Date(updateLiveSessionDto.endTime);
        }
        return this.prisma.liveSession.update({
            where: { id },
            data: updateData,
            include: {
                subject: {
                    include: {
                        class: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }
    async remove(id, teacherId) {
        const session = await this.prisma.liveSession.findUnique({
            where: { id },
        });
        if (!session) {
            throw new common_1.NotFoundException('Live session not found');
        }
        if (session.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You can only delete your own sessions');
        }
        return this.prisma.liveSession.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async joinSession(sessionId, userId) {
        const session = await this.prisma.liveSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException('Live session not found');
        }
        const existingAttendee = await this.prisma.sessionAttendee.findUnique({
            where: {
                sessionId_userId: {
                    sessionId,
                    userId,
                },
            },
        });
        if (existingAttendee) {
            return existingAttendee;
        }
        return this.prisma.sessionAttendee.create({
            data: {
                sessionId,
                userId,
            },
        });
    }
    async leaveSession(sessionId, userId) {
        const attendee = await this.prisma.sessionAttendee.findUnique({
            where: {
                sessionId_userId: {
                    sessionId,
                    userId,
                },
            },
        });
        if (!attendee) {
            throw new common_1.NotFoundException('You have not joined this session');
        }
        return this.prisma.sessionAttendee.update({
            where: {
                sessionId_userId: {
                    sessionId,
                    userId,
                },
            },
            data: {
                leftAt: new Date(),
            },
        });
    }
    async getUpcomingSessions(userId, userRole) {
        const now = new Date();
        const where = {
            isActive: true,
            startTime: {
                gte: now,
            },
        };
        if (userRole === client_1.Role.TEACHER) {
            where.teacherId = userId;
        }
        else if (userRole === client_1.Role.STUDENT) {
            const enrollments = await this.prisma.studentEnrollment.findMany({
                where: {
                    studentId: userId,
                    isActive: true,
                },
                select: {
                    subjectId: true,
                },
            });
            const subjectIds = enrollments.map(e => e.subjectId);
            where.subjectId = { in: subjectIds };
        }
        return this.prisma.liveSession.findMany({
            where,
            include: {
                subject: {
                    include: {
                        class: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                startTime: 'asc',
            },
            take: 5,
        });
    }
};
exports.LiveSessionsService = LiveSessionsService;
exports.LiveSessionsService = LiveSessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LiveSessionsService);
//# sourceMappingURL=live-sessions.service.js.map