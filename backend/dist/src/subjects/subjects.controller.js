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
exports.SubjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const subjects_service_1 = require("./subjects.service");
const create_subject_dto_1 = require("./dto/create-subject.dto");
const update_subject_dto_1 = require("./dto/update-subject.dto");
let SubjectsController = class SubjectsController {
    subjectsService;
    constructor(subjectsService) {
        this.subjectsService = subjectsService;
    }
    create(createSubjectDto) {
        return this.subjectsService.create(createSubjectDto);
    }
    findAll(page, limit, search, classId, isActive) {
        return this.subjectsService.findAll(page, limit, search, classId, isActive);
    }
    findMySubjects(req, page, limit) {
        return this.subjectsService.findByTeacher(req.user.id, page, limit);
    }
    findOne(id) {
        return this.subjectsService.findOne(id);
    }
    getStats(id) {
        return this.subjectsService.getSubjectStats(id);
    }
    assignTeacher(id, teacherId) {
        return this.subjectsService.assignTeacher(id, teacherId);
    }
    unassignTeacher(id, teacherId) {
        return this.subjectsService.unassignTeacher(id, teacherId);
    }
    update(id, updateSubjectDto) {
        return this.subjectsService.update(id, updateSubjectDto);
    }
    remove(id) {
        return this.subjectsService.remove(id);
    }
};
exports.SubjectsController = SubjectsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new subject' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Subject has been successfully created.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Class not found.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'A subject with this name already exists in this class.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subject_dto_1.CreateSubjectDto]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.TEACHER, client_1.Role.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get all subjects' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Number of items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Search term' }),
    (0, swagger_1.ApiQuery)({ name: 'classId', required: false, type: String, description: 'Filter by class ID' }),
    (0, swagger_1.ApiQuery)({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all subjects.' }),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('classId')),
    __param(4, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, Boolean]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-subjects'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get subjects assigned to current teacher' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Number of items per page' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return teacher subjects.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findMySubjects", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.TEACHER, client_1.Role.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get a subject by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the subject.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subject not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.TEACHER),
    (0, swagger_1.ApiOperation)({ summary: 'Get subject statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return subject statistics.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subject not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)(':id/assign-teacher/:teacherId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a teacher to a subject' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Teacher has been successfully assigned.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Subject or teacher not found.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Teacher is already assigned to this subject.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "assignTeacher", null);
__decorate([
    (0, common_1.Delete)(':id/unassign-teacher/:teacherId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Unassign a teacher from a subject' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Teacher has been successfully unassigned.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Teacher assignment not found.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "unassignTeacher", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update a subject' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subject has been successfully updated.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subject not found.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'A subject with this name already exists in this class.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subject_dto_1.UpdateSubjectDto]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a subject' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subject has been successfully deleted.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Subject not found.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Cannot delete subject with active enrollments.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SubjectsController.prototype, "remove", null);
exports.SubjectsController = SubjectsController = __decorate([
    (0, swagger_1.ApiTags)('subjects'),
    (0, common_1.Controller)('subjects'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [subjects_service_1.SubjectsService])
], SubjectsController);
//# sourceMappingURL=subjects.controller.js.map