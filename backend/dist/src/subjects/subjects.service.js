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
exports.SubjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubjectsService = class SubjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSubjectDto) {
        const classExists = await this.prisma.class.findUnique({
            where: { id: createSubjectDto.classId },
        });
        if (!classExists) {
            throw new common_1.BadRequestException('Class not found');
        }
        try {
            const newSubject = await this.prisma.subject.create({
                data: createSubjectDto,
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
                    enrollments: {
                        where: { isActive: true },
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            teachers: true,
                            enrollments: true,
                            materials: true,
                            assignments: true,
                            tests: true,
                        },
                    },
                },
            });
            return newSubject;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('A subject with this name already exists in this class');
            }
            throw error;
        }
    }
    async findAll(page = 1, limit = 10, search, classId, isActive) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (classId) {
            where.classId = classId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [subjects, total] = await Promise.all([
            this.prisma.subject.findMany({
                where,
                skip,
                take: limit,
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
                    enrollments: {
                        where: { isActive: true },
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            teachers: true,
                            enrollments: true,
                            materials: true,
                            assignments: true,
                            tests: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.subject.count({ where }),
        ]);
        return {
            subjects,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const subject = await this.prisma.subject.findUnique({
            where: { id },
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
                enrollments: {
                    where: { isActive: true },
                    include: {
                        student: {
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
                    take: 10,
                },
                assignments: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        teacher: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                tests: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        teacher: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        teachers: true,
                        enrollments: true,
                        materials: true,
                        assignments: true,
                        tests: true,
                    },
                },
            },
        });
        if (!subject) {
            throw new common_1.NotFoundException('Subject not found');
        }
        return subject;
    }
    async update(id, updateSubjectDto) {
        if (updateSubjectDto.classId) {
            const classExists = await this.prisma.class.findUnique({
                where: { id: updateSubjectDto.classId },
            });
            if (!classExists) {
                throw new common_1.BadRequestException('Class not found');
            }
        }
        try {
            const updatedSubject = await this.prisma.subject.update({
                where: { id },
                data: updateSubjectDto,
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
                    enrollments: {
                        where: { isActive: true },
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            teachers: true,
                            enrollments: true,
                            materials: true,
                            assignments: true,
                            tests: true,
                        },
                    },
                },
            });
            return updatedSubject;
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Subject not found');
            }
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('A subject with this name already exists in this class');
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            const subjectWithEnrollments = await this.prisma.subject.findUnique({
                where: { id },
                include: {
                    enrollments: {
                        where: { isActive: true },
                    },
                },
            });
            if (!subjectWithEnrollments) {
                throw new common_1.NotFoundException('Subject not found');
            }
            if (subjectWithEnrollments.enrollments.length > 0) {
                throw new common_1.ConflictException('Cannot delete subject with active enrollments. Please deactivate enrollments first.');
            }
            await this.prisma.subject.delete({
                where: { id },
            });
            return { message: 'Subject deleted successfully' };
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Subject not found');
            }
            throw error;
        }
    }
    async assignTeacher(subjectId, teacherId) {
        const subject = await this.prisma.subject.findUnique({
            where: { id: subjectId },
        });
        if (!subject) {
            throw new common_1.NotFoundException('Subject not found');
        }
        const teacher = await this.prisma.user.findUnique({
            where: { id: teacherId, role: 'TEACHER' },
        });
        if (!teacher) {
            throw new common_1.BadRequestException('Teacher not found or user is not a teacher');
        }
        try {
            const assignment = await this.prisma.teacherSubject.create({
                data: {
                    teacherId,
                    subjectId,
                },
                include: {
                    teacher: {
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
                },
            });
            return assignment;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('Teacher is already assigned to this subject');
            }
            throw error;
        }
    }
    async unassignTeacher(subjectId, teacherId) {
        try {
            await this.prisma.teacherSubject.delete({
                where: {
                    teacherId_subjectId: {
                        teacherId,
                        subjectId,
                    },
                },
            });
            return { message: 'Teacher unassigned successfully' };
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Teacher assignment not found');
            }
            throw error;
        }
    }
    async getSubjectStats(id) {
        const subject = await this.prisma.subject.findUnique({
            where: { id },
            include: {
                teachers: true,
                enrollments: {
                    where: { isActive: true },
                },
                materials: {
                    where: { isActive: true },
                },
                assignments: {
                    where: { isActive: true },
                },
                tests: {
                    where: { isActive: true },
                },
            },
        });
        if (!subject) {
            throw new common_1.NotFoundException('Subject not found');
        }
        return {
            totalTeachers: subject.teachers.length,
            totalStudents: subject.enrollments.length,
            totalMaterials: subject.materials.length,
            totalAssignments: subject.assignments.length,
            totalTests: subject.tests.length,
        };
    }
    async findByTeacher(teacherId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [subjects, total] = await Promise.all([
            this.prisma.subject.findMany({
                where: {
                    teachers: {
                        some: {
                            teacherId,
                            isActive: true,
                        },
                    },
                    isActive: true,
                },
                skip,
                take: limit,
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
                                    email: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            enrollments: true,
                            materials: true,
                            assignments: true,
                            tests: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.subject.count({
                where: {
                    teachers: {
                        some: {
                            teacherId,
                            isActive: true,
                        },
                    },
                    isActive: true,
                },
            }),
        ]);
        return {
            subjects,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
};
exports.SubjectsService = SubjectsService;
exports.SubjectsService = SubjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubjectsService);
//# sourceMappingURL=subjects.service.js.map