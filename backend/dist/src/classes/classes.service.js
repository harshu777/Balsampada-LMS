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
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClassesService = class ClassesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createClassDto) {
        try {
            const newClass = await this.prisma.class.create({
                data: createClassDto,
                include: {
                    subjects: {
                        include: {
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
                        },
                    },
                    announcements: true,
                    _count: {
                        select: {
                            subjects: true,
                        },
                    },
                },
            });
            return newClass;
        }
        catch (error) {
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('A class with this name already exists');
            }
            throw error;
        }
    }
    async findAll(page = 1, limit = 10, search, isActive) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { grade: { contains: search, mode: 'insensitive' } },
                { academicYear: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [classes, total] = await Promise.all([
            this.prisma.class.findMany({
                where,
                skip,
                take: limit,
                include: {
                    subjects: {
                        include: {
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
                        },
                    },
                    announcements: {
                        where: { isActive: true },
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                    },
                    _count: {
                        select: {
                            subjects: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.class.count({ where }),
        ]);
        return {
            classes,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const classData = await this.prisma.class.findUnique({
            where: { id },
            include: {
                subjects: {
                    include: {
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
                        assignments: {
                            where: { isActive: true },
                            take: 5,
                            orderBy: { createdAt: 'desc' },
                        },
                        tests: {
                            where: { isActive: true },
                            take: 5,
                            orderBy: { createdAt: 'desc' },
                        },
                        materials: {
                            where: { isActive: true },
                            take: 5,
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                },
                announcements: {
                    where: { isActive: true },
                    include: {
                        author: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        subjects: true,
                    },
                },
            },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Class not found');
        }
        return classData;
    }
    async update(id, updateClassDto) {
        try {
            const updatedClass = await this.prisma.class.update({
                where: { id },
                data: updateClassDto,
                include: {
                    subjects: {
                        include: {
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
                        },
                    },
                    announcements: true,
                    _count: {
                        select: {
                            subjects: true,
                        },
                    },
                },
            });
            return updatedClass;
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Class not found');
            }
            if (error.code === 'P2002') {
                throw new common_1.ConflictException('A class with this name already exists');
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            const classWithRelations = await this.prisma.class.findUnique({
                where: { id },
                include: {
                    subjects: {
                        include: {
                            enrollments: {
                                where: { isActive: true },
                            },
                        },
                    },
                },
            });
            if (!classWithRelations) {
                throw new common_1.NotFoundException('Class not found');
            }
            const hasActiveEnrollments = classWithRelations.subjects.some(subject => subject.enrollments.length > 0);
            if (hasActiveEnrollments) {
                throw new common_1.ConflictException('Cannot delete class with active enrollments. Please deactivate enrollments first.');
            }
            await this.prisma.class.delete({
                where: { id },
            });
            return { message: 'Class deleted successfully' };
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new common_1.NotFoundException('Class not found');
            }
            throw error;
        }
    }
    async getClassStats(id) {
        const classData = await this.prisma.class.findUnique({
            where: { id },
            include: {
                subjects: {
                    include: {
                        enrollments: {
                            where: { isActive: true },
                        },
                        teachers: true,
                        assignments: {
                            where: { isActive: true },
                        },
                        tests: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        });
        if (!classData) {
            throw new common_1.NotFoundException('Class not found');
        }
        const totalStudents = classData.subjects.reduce((acc, subject) => acc + subject.enrollments.length, 0);
        const totalTeachers = new Set(classData.subjects.flatMap(subject => subject.teachers.map(t => t.teacherId))).size;
        const totalAssignments = classData.subjects.reduce((acc, subject) => acc + subject.assignments.length, 0);
        const totalTests = classData.subjects.reduce((acc, subject) => acc + subject.tests.length, 0);
        return {
            totalSubjects: classData.subjects.length,
            totalStudents,
            totalTeachers,
            totalAssignments,
            totalTests,
        };
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map