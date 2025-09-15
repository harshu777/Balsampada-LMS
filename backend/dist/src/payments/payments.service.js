"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let PaymentsService = class PaymentsService {
    prisma;
    notificationsGateway;
    constructor(prisma, notificationsGateway) {
        this.prisma = prisma;
        this.notificationsGateway = notificationsGateway;
    }
    async createPayment(createPaymentDto, paidByUserId, proofFile) {
        try {
            const student = await this.prisma.user.findUnique({
                where: { id: createPaymentDto.studentId },
            });
            if (!student || student.role !== client_1.Role.STUDENT) {
                throw new common_1.BadRequestException('Invalid student ID');
            }
            const receiptNumber = await this.generateReceiptNumber();
            const paymentData = {
                ...createPaymentDto,
                paidBy: paidByUserId,
                receiptNumber,
                proofFileUrl: proofFile ? `/uploads/payment-proofs/${proofFile.filename}` : null,
                proofFileName: proofFile ? proofFile.originalname : null,
                dueDate: createPaymentDto.dueDate ? new Date(createPaymentDto.dueDate) : null,
            };
            const payment = await this.prisma.payment.create({
                data: paymentData,
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    paidByUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                    enrollment: {
                        include: {
                            subject: {
                                include: {
                                    class: true,
                                },
                            },
                        },
                    },
                },
            });
            await this.createPaymentNotification(payment.id, 'PAYMENT_SUBMITTED');
            return payment;
        }
        catch (error) {
            if (proofFile) {
                try {
                    fs.unlinkSync(proofFile.path);
                }
                catch (unlinkError) {
                    console.error('Error cleaning up file:', unlinkError);
                }
            }
            throw error;
        }
    }
    async getPayments(filters, userRole, userId) {
        const page = parseInt(filters.page || '1') || 1;
        const limit = parseInt(filters.limit || '10') || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (userRole === client_1.Role.STUDENT) {
            where.studentId = userId;
        }
        else if (filters.studentId) {
            where.studentId = filters.studentId;
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.monthYear) {
            where.monthYear = filters.monthYear;
        }
        if (filters.academicYear) {
            where.academicYear = filters.academicYear;
        }
        if (filters.startDate && filters.endDate) {
            where.createdAt = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    paidByUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                    approvedByUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    enrollment: {
                        include: {
                            subject: {
                                include: {
                                    class: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.payment.count({ where }),
        ]);
        return {
            payments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getPaymentById(id, userRole, userId) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
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
                paidByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    },
                },
                approvedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                enrollment: {
                    include: {
                        subject: {
                            include: {
                                class: true,
                            },
                        },
                    },
                },
            },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (userRole === client_1.Role.STUDENT && payment.studentId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return payment;
    }
    async updatePayment(id, updatePaymentDto) {
        const existingPayment = await this.prisma.payment.findUnique({
            where: { id },
        });
        if (!existingPayment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (existingPayment.status !== client_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending payments can be updated');
        }
        return this.prisma.payment.update({
            where: { id },
            data: {
                ...updatePaymentDto,
                dueDate: updatePaymentDto.dueDate ? new Date(updatePaymentDto.dueDate) : undefined,
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
                paidByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    },
                },
            },
        });
    }
    async approvePayment(id, approvePaymentDto, approvedByUserId) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: { student: true },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status !== client_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending payments can be approved');
        }
        const updatedPayment = await this.prisma.payment.update({
            where: { id },
            data: {
                status: client_1.PaymentStatus.APPROVED,
                approvedBy: approvedByUserId,
                approvalDate: new Date(),
                notes: approvePaymentDto.notes || payment.notes,
                receiptNumber: approvePaymentDto.receiptNumber || payment.receiptNumber,
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
                approvedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (payment.enrollmentId && payment.type === client_1.PaymentType.ENROLLMENT_FEE) {
            await this.prisma.studentEnrollment.update({
                where: { id: payment.enrollmentId },
                data: {
                    paymentStatus: client_1.PaymentStatus.APPROVED,
                    isActive: true,
                },
            });
        }
        await this.createPaymentNotification(payment.id, 'PAYMENT_APPROVED');
        return updatedPayment;
    }
    async rejectPayment(id, rejectPaymentDto, rejectedByUserId) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status !== client_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending payments can be rejected');
        }
        const updatedPayment = await this.prisma.payment.update({
            where: { id },
            data: {
                status: client_1.PaymentStatus.REJECTED,
                approvedBy: rejectedByUserId,
                approvalDate: new Date(),
                rejectionReason: rejectPaymentDto.rejectionReason,
                notes: rejectPaymentDto.notes || payment.notes,
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
                approvedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        await this.createPaymentNotification(payment.id, 'PAYMENT_REJECTED');
        return updatedPayment;
    }
    async getPaymentStatistics(filters) {
        const where = {};
        if (filters?.academicYear) {
            where.academicYear = filters.academicYear;
        }
        if (filters?.monthYear) {
            where.monthYear = filters.monthYear;
        }
        const [totalPayments, pendingPayments, approvedPayments, rejectedPayments, totalAmount, approvedAmount,] = await Promise.all([
            this.prisma.payment.count({ where }),
            this.prisma.payment.count({ where: { ...where, status: client_1.PaymentStatus.PENDING } }),
            this.prisma.payment.count({ where: { ...where, status: client_1.PaymentStatus.APPROVED } }),
            this.prisma.payment.count({ where: { ...where, status: client_1.PaymentStatus.REJECTED } }),
            this.prisma.payment.aggregate({
                where,
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { ...where, status: client_1.PaymentStatus.APPROVED },
                _sum: { amount: true },
            }),
        ]);
        const monthlyStats = await this.prisma.payment.groupBy({
            by: ['monthYear'],
            where: {
                ...where,
                status: client_1.PaymentStatus.APPROVED,
                monthYear: { not: null },
            },
            _sum: { amount: true },
            _count: true,
            orderBy: { monthYear: 'desc' },
            take: 12,
        });
        return {
            overview: {
                totalPayments,
                pendingPayments,
                approvedPayments,
                rejectedPayments,
                totalAmount: totalAmount._sum.amount || 0,
                approvedAmount: approvedAmount._sum.amount || 0,
            },
            monthlyStats,
        };
    }
    async getOverduePayments() {
        const currentDate = new Date();
        return this.prisma.payment.findMany({
            where: {
                status: client_1.PaymentStatus.PENDING,
                dueDate: {
                    lt: currentDate,
                },
            },
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
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async deletePayment(id) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status === client_1.PaymentStatus.APPROVED) {
            throw new common_1.BadRequestException('Cannot delete approved payments');
        }
        if (payment.proofFileUrl) {
            try {
                const filePath = path.join(process.cwd(), payment.proofFileUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            catch (error) {
                console.error('Error deleting file:', error);
            }
        }
        return this.prisma.payment.delete({
            where: { id },
        });
    }
    async generateReceiptNumber() {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const monthStart = new Date(year, currentDate.getMonth(), 1);
        const monthEnd = new Date(year, currentDate.getMonth() + 1, 0);
        const count = await this.prisma.payment.count({
            where: {
                createdAt: {
                    gte: monthStart,
                    lte: monthEnd,
                },
            },
        });
        const sequence = (count + 1).toString().padStart(4, '0');
        return `RCP${year}${month}${sequence}`;
    }
    async createPaymentNotification(paymentId, type) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                student: true,
            },
        });
        if (!payment)
            return;
        let title;
        let message;
        let recipients = [];
        switch (type) {
            case 'PAYMENT_SUBMITTED':
                title = 'New Payment Submitted';
                message = `Payment of ₹${payment.amount} submitted by ${payment.student.firstName} ${payment.student.lastName}`;
                const admins = await this.prisma.user.findMany({
                    where: { role: client_1.Role.ADMIN },
                    select: { id: true },
                });
                recipients = admins.map(admin => admin.id);
                break;
            case 'PAYMENT_APPROVED':
                title = 'Payment Approved';
                message = `Your payment of ₹${payment.amount} has been approved. Receipt: ${payment.receiptNumber}`;
                recipients = [payment.studentId];
                break;
            case 'PAYMENT_REJECTED':
                title = 'Payment Rejected';
                message = `Your payment of ₹${payment.amount} has been rejected. Reason: ${payment.rejectionReason}`;
                recipients = [payment.studentId];
                break;
        }
        const notifications = recipients.map(userId => ({
            userId,
            type: 'PAYMENT',
            title,
            message,
            data: { paymentId },
        }));
        if (notifications.length > 0) {
            await this.prisma.notification.createMany({
                data: notifications,
            });
            for (const recipient of recipients) {
                await this.notificationsGateway.sendPaymentNotification(recipient, {
                    id: payment.id,
                    status: payment.status,
                    amount: payment.amount,
                    type: payment.type,
                    rejectionReason: payment.rejectionReason || undefined,
                });
            }
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_gateway_1.NotificationsGateway])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map