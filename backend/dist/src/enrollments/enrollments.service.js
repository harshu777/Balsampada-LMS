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
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EnrollmentsService = class EnrollmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createEnrollmentDto) {
        const student = await this.prisma.user.findUnique({
            where: { id: createEnrollmentDto.studentId, role: 'STUDENT' },
        });
        if (!student) {
            throw new common_1.BadRequestException('Student not found or user is not a student');
        }
        const subject = await this.prisma.subject.findUnique({
            where: { id: createEnrollmentDto.subjectId },
            include: { class: true },
        });
        if (!subject) {
            throw new common_1.BadRequestException('Subject not found');
        }
        try {
            const enrollment = await this.prisma.studentEnrollment.create({
                data: {
                    ...createEnrollmentDto,
                    enrollmentDate: createEnrollmentDto.enrollmentDate
                        ? new Date(createEnrollmentDto.enrollmentDate)
                        : new Date(),
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    subject: {
                        include: {
                            class: true,
                        },
                    },
                    payments: {
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    },
                },
            });
            return enrollment;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Student is already enrolled in this subject');
            }
            throw error;
        }
    }
    async findAll(page = 1, limit = 10, search, subjectId, studentId, isActive, paymentStatus) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                {
                    student: {
                        OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
                {
                    subject: {
                        name: { contains: search, mode: 'insensitive' },
                    },
                },
            ];
        }
        if (subjectId) {
            where.subjectId = subjectId;
        }
        if (studentId) {
            where.studentId = studentId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (paymentStatus) {
            where.paymentStatus = paymentStatus;
        }
        const [enrollments, total] = await Promise.all([
            this.prisma.studentEnrollment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    subject: {
                        include: {
                            class: true,
                        },
                    },
                    payments: {
                        orderBy: { createdAt: 'desc' },
                        take: 3,
                    },
                    _count: {
                        select: {
                            payments: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.studentEnrollment.count({ where }),
        ]);
        return {
            enrollments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const enrollment = await this.prisma.studentEnrollment.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        address: true,
                    },
                },
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
                payments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        paidByUser: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                        approvedByUser: {
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
        if (!enrollment) {
            throw new common_1.NotFoundException('Enrollment not found');
        }
        return enrollment;
    }
    async updateStatus(id, isActive, paymentStatus) {
        try {
            const updateData = { isActive };
            if (paymentStatus !== undefined) {
                updateData.paymentStatus = paymentStatus;
            }
            const updatedEnrollment = await this.prisma.studentEnrollment.update({
                where: { id },
                data: updateData,
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    subject: {
                        include: {
                            class: true,
                        },
                    },
                    payments: {
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    },
                },
            });
            return updatedEnrollment;
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Enrollment not found');
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            const enrollmentWithPayments = await this.prisma.studentEnrollment.findUnique({
                where: { id },
                include: {
                    payments: true,
                },
            });
            if (!enrollmentWithPayments) {
                throw new common_1.NotFoundException('Enrollment not found');
            }
            if (enrollmentWithPayments.payments.length > 0) {
                throw new common_1.ConflictException('Cannot delete enrollment with payment records. Please deactivate instead.');
            }
            await this.prisma.studentEnrollment.delete({
                where: { id },
            });
            return { message: 'Enrollment deleted successfully' };
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Enrollment not found');
            }
            throw error;
        }
    }
    async findByStudent(studentId, page = 1, limit = 10, isActive) {
        const skip = (page - 1) * limit;
        const where = { studentId };
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [enrollments, total] = await Promise.all([
            this.prisma.studentEnrollment.findMany({
                where,
                skip,
                take: limit,
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
                            materials: {
                                where: { isActive: true },
                                orderBy: { createdAt: 'desc' },
                                take: 5,
                            },
                            assignments: {
                                where: { isActive: true },
                                orderBy: { createdAt: 'desc' },
                                take: 5,
                            },
                            tests: {
                                where: { isActive: true },
                                orderBy: { startTime: 'desc' },
                                take: 5,
                            },
                        },
                    },
                    payments: {
                        orderBy: { createdAt: 'desc' },
                        take: 3,
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.studentEnrollment.count({ where }),
        ]);
        return {
            enrollments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findBySubject(subjectId, page = 1, limit = 10, isActive) {
        const skip = (page - 1) * limit;
        const where = { subjectId };
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [enrollments, total] = await Promise.all([
            this.prisma.studentEnrollment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                        },
                    },
                    payments: {
                        orderBy: { createdAt: 'desc' },
                        take: 3,
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.studentEnrollment.count({ where }),
        ]);
        return {
            enrollments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getEnrollmentStats() {
        const [totalEnrollments, activeEnrollments, pendingPayments, approvedPayments, rejectedPayments, enrollmentsByMonth,] = await Promise.all([
            this.prisma.studentEnrollment.count(),
            this.prisma.studentEnrollment.count({ where: { isActive: true } }),
            this.prisma.studentEnrollment.count({ where: { paymentStatus: 'PENDING' } }),
            this.prisma.studentEnrollment.count({ where: { paymentStatus: 'APPROVED' } }),
            this.prisma.studentEnrollment.count({ where: { paymentStatus: 'REJECTED' } }),
            this.prisma.studentEnrollment.groupBy({
                by: ['enrollmentDate'],
                _count: {
                    id: true,
                },
                orderBy: {
                    enrollmentDate: 'desc',
                },
                take: 12,
            }),
        ]);
        return {
            totalEnrollments,
            activeEnrollments,
            inactiveEnrollments: totalEnrollments - activeEnrollments,
            paymentStats: {
                pending: pendingPayments,
                approved: approvedPayments,
                rejected: rejectedPayments,
            },
            enrollmentTrend: enrollmentsByMonth,
        };
    }
    async bulkUpdateStatus(enrollmentIds, isActive, paymentStatus) {
        const updateData = { isActive };
        if (paymentStatus !== undefined) {
            updateData.paymentStatus = paymentStatus;
        }
        const updatedEnrollments = await this.prisma.studentEnrollment.updateMany({
            where: {
                id: {
                    in: enrollmentIds,
                },
            },
            data: updateData,
        });
        return {
            message: `Successfully updated ${updatedEnrollments.count} enrollments`,
            updatedCount: updatedEnrollments.count,
        };
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map