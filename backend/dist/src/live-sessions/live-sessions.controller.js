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
exports.LiveSessionsController = void 0;
const common_1 = require("@nestjs/common");
const live_sessions_service_1 = require("./live-sessions.service");
const create_live_session_dto_1 = require("./dto/create-live-session.dto");
const update_live_session_dto_1 = require("./dto/update-live-session.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let LiveSessionsController = class LiveSessionsController {
    liveSessionsService;
    constructor(liveSessionsService) {
        this.liveSessionsService = liveSessionsService;
    }
    create(createLiveSessionDto, req) {
        return this.liveSessionsService.create(createLiveSessionDto, req.user.id);
    }
    findAll(req) {
        return this.liveSessionsService.findAll(req.user.id, req.user.role);
    }
    getUpcoming(req) {
        return this.liveSessionsService.getUpcomingSessions(req.user.id, req.user.role);
    }
    findOne(id) {
        return this.liveSessionsService.findOne(id);
    }
    update(id, updateLiveSessionDto, req) {
        return this.liveSessionsService.update(id, updateLiveSessionDto, req.user.id);
    }
    remove(id, req) {
        return this.liveSessionsService.remove(id, req.user.id);
    }
    joinSession(id, req) {
        return this.liveSessionsService.joinSession(id, req.user.id);
    }
    leaveSession(id, req) {
        return this.liveSessionsService.leaveSession(id, req.user.id);
    }
};
exports.LiveSessionsController = LiveSessionsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_live_session_dto_1.CreateLiveSessionDto, Object]),
    __metadata("design:returntype", void 0)
], LiveSessionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LiveSessionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LiveSessionsController.prototype, "getUpcoming", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LiveSessionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_live_session_dto_1.UpdateLiveSessionDto, Object]),
    __metadata("design:returntype", void 0)
], LiveSessionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LiveSessionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LiveSessionsController.prototype, "joinSession", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LiveSessionsController.prototype, "leaveSession", null);
exports.LiveSessionsController = LiveSessionsController = __decorate([
    (0, common_1.Controller)('live-sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [live_sessions_service_1.LiveSessionsService])
], LiveSessionsController);
//# sourceMappingURL=live-sessions.controller.js.map