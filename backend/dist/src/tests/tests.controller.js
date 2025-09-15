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
exports.TestsController = void 0;
const common_1 = require("@nestjs/common");
const tests_service_1 = require("./tests.service");
const create_test_dto_1 = require("./dto/create-test.dto");
const update_test_dto_1 = require("./dto/update-test.dto");
const submit_test_dto_1 = require("./dto/submit-test.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let TestsController = class TestsController {
    testsService;
    constructor(testsService) {
        this.testsService = testsService;
    }
    create(createTestDto, user) {
        return this.testsService.create(createTestDto, user.id);
    }
    findAll(page, limit, search, subjectId, teacherId, isActive) {
        return this.testsService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 10, search, subjectId, teacherId, isActive === 'true' ? true : isActive === 'false' ? false : undefined);
    }
    findMyTests(user, page, limit, status) {
        return this.testsService.findStudentTests(user.id, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10, status);
    }
    findOne(id, user, includeAnswers) {
        return this.testsService.findOne(id, user.id, user.role, includeAnswers === 'true');
    }
    getTestStats(id, user) {
        return this.testsService.getTestStats(id, user.id, user.role);
    }
    getTestResults(id, user) {
        return this.testsService.getTestResults(id, user.id);
    }
    update(id, updateTestDto, user) {
        return this.testsService.update(id, updateTestDto, user.id, user.role);
    }
    remove(id, user) {
        return this.testsService.remove(id, user.id, user.role);
    }
    startTest(startDto, user) {
        return this.testsService.startTest(startDto, user.id);
    }
    submitTest(submitDto, user) {
        return this.testsService.submitTest(submitDto, user.id);
    }
};
exports.TestsController = TestsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_test_dto_1.CreateTestDto, Object]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('subjectId')),
    __param(4, (0, common_1.Query)('teacherId')),
    __param(5, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-tests'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "findMyTests", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('includeAnswers')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "getTestStats", null);
__decorate([
    (0, common_1.Get)(':id/results'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "getTestResults", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_test_dto_1.UpdateTestDto, Object]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('start'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_test_dto_1.StartTestDto, Object]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "startTest", null);
__decorate([
    (0, common_1.Post)('submit'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_test_dto_1.SubmitTestDto, Object]),
    __metadata("design:returntype", void 0)
], TestsController.prototype, "submitTest", null);
exports.TestsController = TestsController = __decorate([
    (0, common_1.Controller)('tests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [tests_service_1.TestsService])
], TestsController);
//# sourceMappingURL=tests.controller.js.map