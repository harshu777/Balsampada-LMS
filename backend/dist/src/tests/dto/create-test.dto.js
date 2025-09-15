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
exports.CreateTestDto = exports.QuestionDto = exports.QuestionOptionDto = exports.QuestionType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var QuestionType;
(function (QuestionType) {
    QuestionType["MCQ"] = "MCQ";
    QuestionType["SHORT_ANSWER"] = "SHORT_ANSWER";
    QuestionType["ESSAY"] = "ESSAY";
    QuestionType["TRUE_FALSE"] = "TRUE_FALSE";
    QuestionType["FILL_BLANK"] = "FILL_BLANK";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
class QuestionOptionDto {
    text;
    isCorrect;
}
exports.QuestionOptionDto = QuestionOptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QuestionOptionDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], QuestionOptionDto.prototype, "isCorrect", void 0);
class QuestionDto {
    question;
    type;
    marks;
    options;
    correctAnswer;
    explanation;
    isRequired = true;
}
exports.QuestionDto = QuestionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], QuestionDto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(QuestionType),
    __metadata("design:type", String)
], QuestionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], QuestionDto.prototype, "marks", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => QuestionOptionDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], QuestionDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuestionDto.prototype, "correctAnswer", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QuestionDto.prototype, "explanation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], QuestionDto.prototype, "isRequired", void 0);
class CreateTestDto {
    title;
    description;
    subjectId;
    questions;
    totalMarks;
    duration;
    startTime;
    endTime;
    isActive = true;
    allowMultipleAttempts = false;
    showResultsImmediately = true;
    shuffleQuestions = false;
}
exports.CreateTestDto = CreateTestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTestDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTestDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTestDto.prototype, "subjectId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => QuestionDto),
    __metadata("design:type", Array)
], CreateTestDto.prototype, "questions", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTestDto.prototype, "totalMarks", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateTestDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTestDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTestDto.prototype, "endTime", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTestDto.prototype, "isActive", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTestDto.prototype, "allowMultipleAttempts", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTestDto.prototype, "showResultsImmediately", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTestDto.prototype, "shuffleQuestions", void 0);
//# sourceMappingURL=create-test.dto.js.map