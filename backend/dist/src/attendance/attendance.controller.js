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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
const attendance_scheduler_service_1 = require("./attendance-scheduler.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const mark_attendance_dto_1 = require("./dto/mark-attendance.dto");
const update_attendance_dto_1 = require("./dto/update-attendance.dto");
const attendance_query_dto_1 = require("./dto/attendance-query.dto");
const client_1 = require("@prisma/client");
let AttendanceController = class AttendanceController {
    attendanceService;
    attendanceSchedulerService;
    constructor(attendanceService, attendanceSchedulerService) {
        this.attendanceService = attendanceService;
        this.attendanceSchedulerService = attendanceSchedulerService;
    }
    async markAttendance(markAttendanceDto, req) {
        try {
            const attendance = await this.attendanceService.markAttendance(markAttendanceDto, req.user.userId);
            return {
                status: 'success',
                message: 'Attendance marked successfully',
                data: attendance
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async bulkMarkAttendance(bulkMarkAttendanceDto, req) {
        try {
            const results = await this.attendanceService.bulkMarkAttendance(bulkMarkAttendanceDto, req.user.userId);
            return {
                status: 'success',
                message: 'Bulk attendance marked successfully',
                data: results
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async updateAttendance(id, updateAttendanceDto) {
        try {
            const attendance = await this.attendanceService.updateAttendance(id, updateAttendanceDto);
            return {
                status: 'success',
                message: 'Attendance updated successfully',
                data: attendance
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getAttendance(query) {
        try {
            const result = await this.attendanceService.getAttendance(query);
            return {
                status: 'success',
                message: 'Attendance records retrieved successfully',
                data: result
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getAttendanceStats(query, req) {
        try {
            if (req.user.role === client_1.Role.STUDENT) {
                query.studentId = req.user.userId;
            }
            const stats = await this.attendanceService.getAttendanceStats(query);
            return {
                status: 'success',
                message: 'Attendance statistics retrieved successfully',
                data: stats
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getStudentAttendanceReport(studentId, req, subjectId) {
        try {
            if (req.user.role === client_1.Role.STUDENT && req.user.userId !== studentId) {
                throw new common_1.HttpException({
                    status: 'error',
                    message: 'Access denied'
                }, common_1.HttpStatus.FORBIDDEN);
            }
            const report = await this.attendanceService.getStudentAttendanceReport(studentId, subjectId);
            return {
                status: 'success',
                message: 'Student attendance report retrieved successfully',
                data: report
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message
            }, error.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getSessionAttendance(sessionId) {
        try {
            const attendance = await this.attendanceService.getSessionAttendance(sessionId);
            return {
                status: 'success',
                message: 'Session attendance retrieved successfully',
                data: attendance
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getAttendanceAlerts() {
        try {
            const alerts = await this.attendanceService.getAttendanceAlerts();
            return {
                status: 'success',
                message: 'Attendance alerts retrieved successfully',
                data: alerts
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getMyAttendance(query, req) {
        try {
            query.studentId = req.user.userId;
            const result = await this.attendanceService.getAttendance(query);
            return {
                status: 'success',
                message: 'Your attendance records retrieved successfully',
                data: result
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async deleteAttendance(id) {
        try {
            await this.attendanceService.deleteAttendance(id);
            return {
                status: 'success',
                message: 'Attendance record deleted successfully'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async sendAttendanceAlert(body) {
        try {
            await this.attendanceSchedulerService.sendAttendanceAlert(body.studentId, body.subjectId, body.message);
            return {
                status: 'success',
                message: 'Attendance alert sent successfully'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async triggerDailyAttendanceCheck() {
        try {
            await this.attendanceSchedulerService.checkLowAttendanceDaily();
            return {
                status: 'success',
                message: 'Daily attendance check triggered successfully'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                status: 'error',
                message: error.message
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('mark'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mark_attendance_dto_1.MarkAttendanceDto, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "markAttendance", null);
__decorate([
    (0, common_1.Post)('bulk-mark'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mark_attendance_dto_1.BulkMarkAttendanceDto, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "bulkMarkAttendance", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_attendance_dto_1.UpdateAttendanceDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "updateAttendance", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_query_dto_1.AttendanceQueryDto]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendance", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_query_dto_1.AttendanceStatsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendanceStats", null);
__decorate([
    (0, common_1.Get)('student/:studentId/report'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN, client_1.Role.STUDENT),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('subjectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getStudentAttendanceReport", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getSessionAttendance", null);
__decorate([
    (0, common_1.Get)('alerts'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.TEACHER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendanceAlerts", null);
__decorate([
    (0, common_1.Get)('my-attendance'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_query_dto_1.AttendanceQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getMyAttendance", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "deleteAttendance", null);
__decorate([
    (0, common_1.Post)('send-alert'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.TEACHER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "sendAttendanceAlert", null);
__decorate([
    (0, common_1.Post)('trigger-daily-check'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "triggerDailyAttendanceCheck", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService,
        attendance_scheduler_service_1.AttendanceSchedulerService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map