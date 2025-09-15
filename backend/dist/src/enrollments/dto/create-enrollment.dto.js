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
exports.CreateEnrollmentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateEnrollmentDto {
    studentId;
    subjectId;
    enrollmentDate;
    paymentStatus;
    isActive;
}
exports.CreateEnrollmentDto = CreateEnrollmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The ID of the student to enroll' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The ID of the subject to enroll in' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "subjectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The enrollment date',
        required: false,
        example: '2024-01-15T00:00:00Z'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "enrollmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The payment status of the enrollment',
        enum: client_1.PaymentStatus,
        required: false,
        default: client_1.PaymentStatus.PENDING
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentStatus),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the enrollment is active',
        required: false,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateEnrollmentDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-enrollment.dto.js.map