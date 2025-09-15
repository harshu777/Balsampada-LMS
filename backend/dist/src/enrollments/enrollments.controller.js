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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const enrollments_service_1 = require("./enrollments.service");
const create_enrollment_dto_1 = require("./dto/create-enrollment.dto");
let EnrollmentsController = class EnrollmentsController {
    enrollmentsService;
    constructor(enrollmentsService) {
        this.enrollmentsService = enrollmentsService;
    }
    create(createEnrollmentDto) {
        return this.enrollmentsService.create(createEnrollmentDto);
    }
    findAll(page, limit, search, subjectId, studentId, isActive, paymentStatus) {
        return this.enrollmentsService.findAll(page, limit, search, subjectId, studentId, isActive, paymentStatus);
    }
    findMyEnrollments(req, page, limit, isActive) {
        return this.enrollmentsService.findByStudent(req.user.id, page, limit, isActive);
    }
    getStats() {
        return this.enrollmentsService.getEnrollmentStats();
    }
    findBySubject(subjectId, page, limit, isActive) {
        return this.enrollmentsService.findBySubject(subjectId, page, limit, isActive);
    }
    findByStudent(studentId, page, limit, isActive) {
        return this.enrollmentsService.findByStudent(studentId, page, limit, isActive);
    }
    findOne(id) {
        return this.enrollmentsService.findOne(id);
    }
    updateStatus(id, body) {
        return this.enrollmentsService.updateStatus(id, body.isActive, body.paymentStatus);
    }
    bulkUpdateStatus(body) {
        return this.enrollmentsService.bulkUpdateStatus(body.enrollmentIds, body.isActive, body.paymentStatus);
    }
    remove(id) {
        return this.enrollmentsService.remove(id);
    }
};
exports.EnrollmentsController = EnrollmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new enrollment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Enrollment has been successfully created.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Student or subject not found.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Student is already enrolled in this subject.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_enrollment_dto_1.CreateEnrollmentDto]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all enrollments' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Number of items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'subjectId', required: false, type: String, description: 'Filter by subject ID' }),
    (0, swagger_1.ApiQuery)({ name: 'studentId', required: false, type: String, description: 'Filter by student ID' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' }),
    (0, swagger_1.ApiQuery)({ name: 'paymentStatus', required: false, enum: client_1.PaymentStatus, description: 'Filter by payment status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all enrollments.' }),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('subjectId')),
    __param(4, (0, common_1.Query)('studentId')),
    __param(5, (0, common_1.Query)('isActive')),
    __param(6, (0, common_1.Query)('paymentStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, Boolean, String]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-enrollments'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get enrollments for current student' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Number of items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return student enrollments.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Boolean]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "findMyEnrollments", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get enrollment statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return enrollment statistics.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('subject/:subjectId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get enrollments for a specific subject' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Number of items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return subject enrollments.' }),
    __param(0, (0, common_1.Param)('subjectId')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Boolean]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "findBySubject", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get enrollments for a specific student' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Number of items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return student enrollments.' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Boolean]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "findByStudent", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.TEACHER, client_1.Role.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get an enrollment by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the enrollment.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Enrollment not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update enrollment status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Enrollment status has been successfully updated.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Enrollment not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)('bulk-update'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk update enrollment status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Enrollments have been successfully updated.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "bulkUpdateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an enrollment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Enrollment has been successfully deleted.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Enrollment not found.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Cannot delete enrollment with payment records.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnrollmentsController.prototype, "remove", null);
exports.EnrollmentsController = EnrollmentsController = __decorate([
    (0, swagger_1.ApiTags)('enrollments'),
    (0, common_1.Controller)('enrollments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [enrollments_service_1.EnrollmentsService])
], EnrollmentsController);
//# sourceMappingURL=enrollments.controller.js.map