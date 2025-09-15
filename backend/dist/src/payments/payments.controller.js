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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const payments_service_1 = require("./payments.service");
const dto_1 = require("./dto");
const client_1 = require("@prisma/client");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async createPayment(createPaymentDto, proofFile, req) {
        return this.paymentsService.createPayment(createPaymentDto, req.user.id, proofFile);
    }
    async getPayments(filters, req) {
        return this.paymentsService.getPayments(filters, req.user.role, req.user.id);
    }
    async getPaymentStatistics(filters) {
        return this.paymentsService.getPaymentStatistics(filters);
    }
    async getOverduePayments() {
        return this.paymentsService.getOverduePayments();
    }
    async getPaymentById(id, req) {
        return this.paymentsService.getPaymentById(id, req.user.role, req.user.id);
    }
    async getPaymentProof(id, req, res) {
        const payment = await this.paymentsService.getPaymentById(id, req.user.role, req.user.id);
        if (!payment.proofFileUrl) {
            throw new common_1.BadRequestException('No proof file found for this payment');
        }
        const filePath = path.join(process.cwd(), payment.proofFileUrl);
        if (!fs.existsSync(filePath)) {
            throw new common_1.BadRequestException('Proof file not found on server');
        }
        res.sendFile(filePath);
    }
    async updatePayment(id, updatePaymentDto) {
        return this.paymentsService.updatePayment(id, updatePaymentDto);
    }
    async approvePayment(id, approvePaymentDto, req) {
        return this.paymentsService.approvePayment(id, approvePaymentDto, req.user.id);
    }
    async rejectPayment(id, rejectPaymentDto, req) {
        return this.paymentsService.rejectPayment(id, rejectPaymentDto, req.user.id);
    }
    async deletePayment(id) {
        return this.paymentsService.deletePayment(id);
    }
    async createMonthlyPayment(createPaymentDto, proofFile, req) {
        const paymentData = {
            ...createPaymentDto,
            studentId: req.user.id,
            type: 'MONTHLY_FEE',
        };
        return this.paymentsService.createPayment(paymentData, req.user.id, proofFile);
    }
    async getStudentPaymentHistory(filters, req) {
        const studentFilters = {
            ...filters,
            studentId: req.user.id,
        };
        return this.paymentsService.getPayments(studentFilters, req.user.role, req.user.id);
    }
    async getPendingPayments(filters) {
        const pendingFilters = {
            ...filters,
            status: 'PENDING',
        };
        return this.paymentsService.getPayments(pendingFilters, client_1.Role.ADMIN);
    }
    async bulkApprovePayments({ paymentIds, notes }, req) {
        const results = await Promise.allSettled(paymentIds.map(id => this.paymentsService.approvePayment(id, { notes }, req.user.id)));
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        return {
            message: `Bulk approval completed: ${successful} successful, ${failed} failed`,
            results,
        };
    }
    async bulkRejectPayments({ paymentIds, rejectionReason, notes }, req) {
        const results = await Promise.allSettled(paymentIds.map(id => this.paymentsService.rejectPayment(id, { rejectionReason, notes }, req.user.id)));
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        return {
            message: `Bulk rejection completed: ${successful} successful, ${failed} failed`,
            results,
        };
    }
    async generateReceipt(id, req) {
        const payment = await this.paymentsService.getPaymentById(id, req.user.role, req.user.id);
        if (payment.status !== 'APPROVED') {
            throw new common_1.BadRequestException('Receipt can only be generated for approved payments');
        }
        return {
            message: 'Receipt generation functionality to be implemented',
            payment: {
                receiptNumber: payment.receiptNumber,
                amount: payment.amount,
                approvalDate: payment.approvalDate,
            },
        };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('proofFile')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePaymentDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PaymentFilterDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentStatistics", null);
__decorate([
    (0, common_1.Get)('overdue'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getOverduePayments", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentById", null);
__decorate([
    (0, common_1.Get)(':id/proof'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentProof", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "updatePayment", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ApprovePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "approvePayment", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.RejectPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "rejectPayment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "deletePayment", null);
__decorate([
    (0, common_1.Post)('student/monthly'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('proofFile')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createMonthlyPayment", null);
__decorate([
    (0, common_1.Get)('student/history'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PaymentFilterDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getStudentPaymentHistory", null);
__decorate([
    (0, common_1.Get)('admin/pending'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PaymentFilterDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPendingPayments", null);
__decorate([
    (0, common_1.Post)('admin/bulk-approve'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "bulkApprovePayments", null);
__decorate([
    (0, common_1.Post)('admin/bulk-reject'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "bulkRejectPayments", null);
__decorate([
    (0, common_1.Get)(':id/receipt'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "generateReceipt", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map