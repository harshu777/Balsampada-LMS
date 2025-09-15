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
exports.ApprovalGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let ApprovalGuard = class ApprovalGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const skipApproval = this.reflector.get('skipApproval', context.getHandler());
        if (skipApproval) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        if (user.role === 'ADMIN') {
            return true;
        }
        if (user.status !== 'APPROVED') {
            throw new common_1.ForbiddenException('Your account is pending approval. Please wait for admin approval to access this feature.');
        }
        return true;
    }
};
exports.ApprovalGuard = ApprovalGuard;
exports.ApprovalGuard = ApprovalGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], ApprovalGuard);
//# sourceMappingURL=approval.guard.js.map