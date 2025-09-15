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
exports.MaterialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const promises_1 = require("fs/promises");
const path_1 = require("path");
let MaterialsService = class MaterialsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createMaterialDto, file, userId) {
        const teacher = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { teacherSubjects: true },
        });
        if (!teacher || teacher.role !== 'TEACHER') {
            throw new common_1.ForbiddenException('Only teachers can upload materials');
        }
        const isTeachingSubject = teacher.teacherSubjects.some(ts => ts.subjectId === createMaterialDto.subjectId);
        if (!isTeachingSubject) {
            throw new common_1.ForbiddenException('You can only upload materials for subjects you teach');
        }
        return this.prisma.material.create({
            data: {
                title: createMaterialDto.title,
                description: createMaterialDto.description,
                subjectId: createMaterialDto.subjectId,
                uploadedById: userId,
                fileUrl: `/uploads/materials/${file.filename}`,
                fileName: file.originalname,
                fileSize: file.size,
                fileType: file.mimetype,
            },
            include: {
                subject: {
                    include: {
                        class: true,
                    },
                },
                uploadedBy: {
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
    async findAll(subjectId, userId, userRole) {
        const where = {};
        if (subjectId) {
            where.subjectId = subjectId;
        }
        if (userRole === 'STUDENT') {
            const enrollments = await this.prisma.studentEnrollment.findMany({
                where: {
                    studentId: userId,
                    isActive: true,
                },
                select: { subjectId: true },
            });
            const enrolledSubjectIds = enrollments.map(e => e.subjectId);
            where.subjectId = { in: enrolledSubjectIds };
        }
        else if (userRole === 'TEACHER') {
            const teacherSubjects = await this.prisma.teacherSubject.findMany({
                where: {
                    teacherId: userId,
                    isActive: true,
                },
                select: { subjectId: true },
            });
            const teachingSubjectIds = teacherSubjects.map(ts => ts.subjectId);
            where.subjectId = { in: teachingSubjectIds };
        }
        return this.prisma.material.findMany({
            where,
            include: {
                subject: {
                    include: {
                        class: true,
                    },
                },
                uploadedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, userId, userRole) {
        const material = await this.prisma.material.findUnique({
            where: { id },
            include: {
                subject: {
                    include: {
                        class: true,
                    },
                },
                uploadedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        if (!material) {
            throw new common_1.NotFoundException('Material not found');
        }
        if (userRole === 'STUDENT') {
            const enrollment = await this.prisma.studentEnrollment.findFirst({
                where: {
                    studentId: userId,
                    subjectId: material.subjectId,
                    isActive: true,
                },
            });
            if (!enrollment) {
                throw new common_1.ForbiddenException('You are not enrolled in this subject');
            }
        }
        else if (userRole === 'TEACHER' && material.uploadedById !== userId) {
            const teacherSubject = await this.prisma.teacherSubject.findFirst({
                where: {
                    teacherId: userId,
                    subjectId: material.subjectId,
                    isActive: true,
                },
            });
            if (!teacherSubject) {
                throw new common_1.ForbiddenException('You do not have access to this material');
            }
        }
        await this.prisma.material.update({
            where: { id },
            data: { downloadCount: { increment: 1 } },
        });
        return material;
    }
    async update(id, updateMaterialDto, userId) {
        const material = await this.prisma.material.findUnique({
            where: { id },
        });
        if (!material) {
            throw new common_1.NotFoundException('Material not found');
        }
        if (material.uploadedById !== userId) {
            throw new common_1.ForbiddenException('You can only update your own materials');
        }
        return this.prisma.material.update({
            where: { id },
            data: updateMaterialDto,
            include: {
                subject: {
                    include: {
                        class: true,
                    },
                },
                uploadedBy: {
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
    async remove(id, userId, userRole) {
        const material = await this.prisma.material.findUnique({
            where: { id },
        });
        if (!material) {
            throw new common_1.NotFoundException('Material not found');
        }
        if (userRole !== 'ADMIN' && material.uploadedById !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own materials');
        }
        if (material.fileUrl) {
            try {
                const filePath = (0, path_1.join)(process.cwd(), material.fileUrl);
                await (0, promises_1.unlink)(filePath);
            }
            catch (error) {
                console.error('Error deleting file:', error);
            }
        }
        return this.prisma.material.delete({
            where: { id },
        });
    }
};
exports.MaterialsService = MaterialsService;
exports.MaterialsService = MaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaterialsService);
//# sourceMappingURL=materials.service.js.map