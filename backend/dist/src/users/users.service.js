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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    prisma;
    emailService;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async getStudents(status) {
        const where = {
            role: client_1.Role.STUDENT,
            ...(status && { status }),
        };
        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                address: true,
                status: true,
                createdAt: true,
                lastLogin: true,
                documents: {
                    select: {
                        id: true,
                        type: true,
                        fileUrl: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getTeachers(status) {
        const where = {
            role: client_1.Role.TEACHER,
            ...(status && { status }),
        };
        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                address: true,
                status: true,
                createdAt: true,
                lastLogin: true,
                documents: {
                    select: {
                        id: true,
                        type: true,
                        fileUrl: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                address: true,
                role: true,
                status: true,
                createdAt: true,
                lastLogin: true,
                documents: {
                    select: {
                        id: true,
                        type: true,
                        fileUrl: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        reviewNotes: true,
                    },
                },
                studentPayments: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        dueDate: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10,
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateUserStatus(id, status, remarks) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role === client_1.Role.ADMIN) {
            throw new common_1.BadRequestException('Cannot change admin status');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                status,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                status: true,
            },
        });
        if (remarks || status === client_1.UserStatus.APPROVED || status === client_1.UserStatus.REJECTED) {
            await this.prisma.document.updateMany({
                where: { userId: id },
                data: {
                    ...(status === client_1.UserStatus.APPROVED && {
                        status: client_1.DocumentStatus.APPROVED,
                        updatedAt: new Date(),
                    }),
                    ...(status === client_1.UserStatus.REJECTED && {
                        status: client_1.DocumentStatus.REJECTED,
                    }),
                    ...(remarks && { reviewNotes: remarks }),
                },
            });
        }
        if (status === client_1.UserStatus.APPROVED || status === client_1.UserStatus.REJECTED) {
            try {
                const fullName = `${updatedUser.firstName} ${updatedUser.lastName}`;
                await this.emailService.sendApprovalEmail(updatedUser.email, fullName, status, remarks);
                console.log(`✅ ${status} email sent to ${updatedUser.email}`);
            }
            catch (error) {
                console.error(`Failed to send ${status} email to ${updatedUser.email}:`, error);
            }
        }
        return updatedUser;
    }
    async deleteUser(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role === client_1.Role.ADMIN) {
            throw new common_1.BadRequestException('Cannot delete admin user');
        }
        await this.prisma.$transaction([
            this.prisma.document.deleteMany({ where: { userId: id } }),
            this.prisma.payment.deleteMany({ where: { studentId: id } }),
            this.prisma.attendance.deleteMany({ where: { studentId: id } }),
            this.prisma.message.deleteMany({ where: { senderId: id } }),
            this.prisma.message.deleteMany({ where: { receiverId: id } }),
            this.prisma.notification.deleteMany({ where: { userId: id } }),
            this.prisma.user.delete({ where: { id } }),
        ]);
        return { message: 'User deleted successfully' };
    }
    async getStats() {
        const [totalStudents, pendingStudents, totalTeachers, pendingTeachers] = await Promise.all([
            this.prisma.user.count({
                where: { role: client_1.Role.STUDENT, status: client_1.UserStatus.APPROVED },
            }),
            this.prisma.user.count({
                where: { role: client_1.Role.STUDENT, status: client_1.UserStatus.PENDING },
            }),
            this.prisma.user.count({
                where: { role: client_1.Role.TEACHER, status: client_1.UserStatus.APPROVED },
            }),
            this.prisma.user.count({
                where: { role: client_1.Role.TEACHER, status: client_1.UserStatus.PENDING },
            }),
        ]);
        return {
            students: {
                total: totalStudents,
                pending: pendingStudents,
            },
            teachers: {
                total: totalTeachers,
                pending: pendingTeachers,
            },
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], UsersService);
//# sourceMappingURL=users.service.js.map