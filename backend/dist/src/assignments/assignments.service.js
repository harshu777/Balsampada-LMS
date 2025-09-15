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
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
let AssignmentsService = class AssignmentsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(createAssignmentDto, teacherId) {
        const teacherSubject = await this.prisma.teacherSubject.findFirst({
            where: {
                teacherId,
                subjectId: createAssignmentDto.subjectId,
                isActive: true,
            },
            include: {
                subject: {
                    include: {
                        class: true,
                    },
                },
            },
        });
        if (!teacherSubject) {
            throw new common_1.ForbiddenException('You do not have permission to create assignments for this subject');
        }
        const assignment = await this.prisma.assignment.create({
            data: {
                ...createAssignmentDto,
                teacherId,
                dueDate: new Date(createAssignmentDto.dueDate),
            },
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
                                        email: true,
                                    },
                                },
                            },
                        },
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
        const studentIds = assignment.subject.enrollments.map(e => e.studentId);
        if (studentIds.length > 0) {
            await this.prisma.studentAssignment.createMany({
                data: studentIds.map(studentId => ({
                    assignmentId: assignment.id,
                    studentId,
                })),
            });
            const teacherName = `${assignment.teacher.firstName} ${assignment.teacher.lastName}`;
            await this.notificationsService.createAssignmentNotification(studentIds, assignment.id, assignment.title, assignment.subject.name, assignment.dueDate, teacherName);
        }
        return assignment;
    }
    async findAll(page = 1, limit = 10, search, subjectId, teacherId, isActive) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (subjectId)
            where.subjectId = subjectId;
        if (teacherId)
            where.teacherId = teacherId;
        if (isActive !== undefined)
            where.isActive = isActive;
        const [assignments, total] = await Promise.all([
            this.prisma.assignment.findMany({
                where,
                skip,
                take: limit,
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
                    submissions: {
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
                            submissions: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.assignment.count({ where }),
        ]);
        return {
            assignments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, userId, userRole) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
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
                                        email: true,
                                    },
                                },
                            },
                        },
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
                submissions: {
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
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        if (userRole === client_1.Role.STUDENT) {
            const isEnrolled = assignment.subject.enrollments.some(e => e.studentId === userId);
            if (!isEnrolled) {
                throw new common_1.ForbiddenException('You are not enrolled in this subject');
            }
        }
        else if (userRole === client_1.Role.TEACHER && assignment.teacherId !== userId) {
            throw new common_1.ForbiddenException('You can only view your own assignments');
        }
        return assignment;
    }
    async findStudentAssignments(studentId, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const where = {
            studentId,
            assignment: { isActive: true },
        };
        if (status === 'pending') {
            where.submittedAt = null;
        }
        else if (status === 'submitted') {
            where.submittedAt = { not: null };
            where.gradedAt = null;
        }
        else if (status === 'graded') {
            where.gradedAt = { not: null };
        }
        const [assignments, total] = await Promise.all([
            this.prisma.studentAssignment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    assignment: {
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
                    },
                },
                orderBy: { assignment: { dueDate: 'asc' } },
            }),
            this.prisma.studentAssignment.count({ where }),
        ]);
        return {
            assignments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async update(id, updateAssignmentDto, teacherId, userRole) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        if (userRole === client_1.Role.TEACHER && assignment.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You can only update your own assignments');
        }
        const updateData = { ...updateAssignmentDto };
        if (updateAssignmentDto.dueDate) {
            updateData.dueDate = new Date(updateAssignmentDto.dueDate);
        }
        const updatedAssignment = await this.prisma.assignment.update({
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
                submissions: {
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
                        submissions: true,
                    },
                },
            },
        });
        return updatedAssignment;
    }
    async remove(id, teacherId, userRole) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id },
            include: {
                submissions: true,
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        if (userRole === client_1.Role.TEACHER && assignment.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You can only delete your own assignments');
        }
        if (assignment.submissions.length > 0) {
            await this.prisma.assignment.update({
                where: { id },
                data: { isActive: false },
            });
            return { message: 'Assignment deactivated successfully (submissions exist)' };
        }
        else {
            await this.prisma.assignment.delete({
                where: { id },
            });
            return { message: 'Assignment deleted successfully' };
        }
    }
    async submitAssignment(submitDto, studentId, attachmentUrl) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id: submitDto.assignmentId },
            include: {
                subject: {
                    include: {
                        enrollments: {
                            where: { studentId, isActive: true },
                        },
                    },
                },
            },
        });
        if (!assignment || !assignment.isActive) {
            throw new common_1.NotFoundException('Assignment not found or inactive');
        }
        if (assignment.subject.enrollments.length === 0) {
            throw new common_1.ForbiddenException('You are not enrolled in this subject');
        }
        if (new Date() > assignment.dueDate) {
            throw new common_1.BadRequestException('Assignment submission deadline has passed');
        }
        const existingSubmission = await this.prisma.studentAssignment.findUnique({
            where: {
                assignmentId_studentId: {
                    assignmentId: submitDto.assignmentId,
                    studentId,
                },
            },
        });
        if (!existingSubmission) {
            throw new common_1.NotFoundException('Student assignment record not found');
        }
        if (existingSubmission.submittedAt) {
            throw new common_1.BadRequestException('Assignment already submitted');
        }
        const submissionData = {
            submittedAt: new Date(),
        };
        if (submitDto.submissionText) {
            submissionData.submissionText = submitDto.submissionText;
        }
        if (attachmentUrl || submitDto.submissionUrl) {
            submissionData.submissionUrl = attachmentUrl || submitDto.submissionUrl;
        }
        const submission = await this.prisma.studentAssignment.update({
            where: {
                assignmentId_studentId: {
                    assignmentId: submitDto.assignmentId,
                    studentId,
                },
            },
            data: submissionData,
            include: {
                assignment: {
                    include: {
                        subject: true,
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
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        return submission;
    }
    async gradeAssignment(gradeDto, teacherId, userRole) {
        const studentAssignment = await this.prisma.studentAssignment.findUnique({
            where: { id: gradeDto.studentAssignmentId },
            include: {
                assignment: {
                    include: {
                        subject: true,
                    },
                },
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        if (!studentAssignment) {
            throw new common_1.NotFoundException('Student assignment not found');
        }
        if (userRole === client_1.Role.TEACHER && studentAssignment.assignment.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You can only grade assignments from your subjects');
        }
        if (!studentAssignment.submittedAt) {
            throw new common_1.BadRequestException('Cannot grade unsubmitted assignment');
        }
        if (gradeDto.marksObtained !== undefined && studentAssignment.assignment.totalMarks) {
            if (gradeDto.marksObtained > studentAssignment.assignment.totalMarks) {
                throw new common_1.BadRequestException('Marks obtained cannot exceed total marks');
            }
            if (gradeDto.marksObtained < 0) {
                throw new common_1.BadRequestException('Marks obtained cannot be negative');
            }
        }
        const gradedAssignment = await this.prisma.studentAssignment.update({
            where: { id: gradeDto.studentAssignmentId },
            data: {
                marksObtained: gradeDto.marksObtained,
                feedback: gradeDto.feedback,
                gradedAt: new Date(),
            },
            include: {
                assignment: {
                    include: {
                        subject: true,
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
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        await this.notificationsService.createNotification({
            userId: studentAssignment.student.id,
            type: 'ASSIGNMENT',
            title: 'Assignment Graded',
            message: `Your assignment "${studentAssignment.assignment.title}" has been graded.`,
            data: {
                assignmentId: studentAssignment.assignment.id,
                studentAssignmentId: studentAssignment.id,
                marksObtained: gradeDto.marksObtained,
                totalMarks: studentAssignment.assignment.totalMarks,
                feedback: gradeDto.feedback,
            },
        });
        return gradedAssignment;
    }
    async getAssignmentStats(assignmentId, teacherId, userRole) {
        const assignment = await this.prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                submissions: {
                    select: {
                        submittedAt: true,
                        gradedAt: true,
                        marksObtained: true,
                    },
                },
                subject: {
                    include: {
                        enrollments: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        if (userRole === client_1.Role.TEACHER && assignment.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You can only view stats for your own assignments');
        }
        const totalStudents = assignment.subject.enrollments.length;
        const totalSubmissions = assignment.submissions.filter(s => s.submittedAt).length;
        const pendingSubmissions = totalStudents - totalSubmissions;
        const gradedSubmissions = assignment.submissions.filter(s => s.gradedAt).length;
        const pendingGrading = totalSubmissions - gradedSubmissions;
        const marks = assignment.submissions
            .filter(s => s.marksObtained !== null)
            .map(s => s.marksObtained);
        const avgMarks = marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
        const maxMarks = marks.length > 0 ? Math.max(...marks) : 0;
        const minMarks = marks.length > 0 ? Math.min(...marks) : 0;
        return {
            totalStudents,
            totalSubmissions,
            pendingSubmissions,
            gradedSubmissions,
            pendingGrading,
            submissionRate: totalStudents > 0 ? (totalSubmissions / totalStudents) * 100 : 0,
            gradingRate: totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0,
            averageMarks: Math.round(avgMarks * 100) / 100,
            maxMarks,
            minMarks,
            totalMarks: assignment.totalMarks,
        };
    }
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map