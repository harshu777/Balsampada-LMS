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
exports.TimetableController = void 0;
const common_1 = require("@nestjs/common");
const timetable_service_1 = require("./timetable.service");
const timetable_dto_1 = require("./dto/timetable.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let TimetableController = class TimetableController {
    timetableService;
    constructor(timetableService) {
        this.timetableService = timetableService;
    }
    create(createTimetableDto, req) {
        return this.timetableService.create(createTimetableDto, req.user.id);
    }
    findAll(startDate, endDate, req) {
        return this.timetableService.findAll(req.user.id, req.user.role, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
    findByWeek(date, req) {
        return this.timetableService.findByWeek(req.user.id, req.user.role, date ? new Date(date) : new Date());
    }
    findByDay(date, req) {
        return this.timetableService.findByDay(req.user.id, req.user.role, date ? new Date(date) : new Date());
    }
    getUpcoming(limit, req) {
        return this.timetableService.getUpcomingSessions(req.user.id, req.user.role, limit ? parseInt(limit) : 5);
    }
    findOne(id) {
        return this.timetableService.findOne(id);
    }
    update(id, updateTimetableDto, req) {
        return this.timetableService.update(id, updateTimetableDto, req.user.id);
    }
    remove(id, req) {
        return this.timetableService.remove(id, req.user.id);
    }
};
exports.TimetableController = TimetableController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'TEACHER'),
    (0, swagger_1.ApiOperation)({ summary: 'Create timetable entry' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.CreateTimetableDto, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all timetable entries' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('week'),
    (0, swagger_1.ApiOperation)({ summary: 'Get timetable for current week' }),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "findByWeek", null);
__decorate([
    (0, common_1.Get)('day'),
    (0, swagger_1.ApiOperation)({ summary: 'Get timetable for specific day' }),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "findByDay", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming sessions' }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getUpcoming", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get timetable entry by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'TEACHER'),
    (0, swagger_1.ApiOperation)({ summary: 'Update timetable entry' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, timetable_dto_1.UpdateTimetableDto, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'TEACHER'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete timetable entry' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "remove", null);
exports.TimetableController = TimetableController = __decorate([
    (0, swagger_1.ApiTags)('timetable'),
    (0, common_1.Controller)('timetable'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [timetable_service_1.TimetableService])
], TimetableController);
//# sourceMappingURL=timetable.controller.js.map