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
exports.DocumentResponseDto = exports.UploadDocumentDto = exports.DocumentType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var DocumentType;
(function (DocumentType) {
    DocumentType["ID_PROOF"] = "id_proof";
    DocumentType["PHOTO"] = "photo";
    DocumentType["MARKSHEET"] = "marksheet";
    DocumentType["CERTIFICATE"] = "certificate";
    DocumentType["RESUME"] = "resume";
    DocumentType["EXPERIENCE_LETTER"] = "experience_letter";
    DocumentType["QUALIFICATION"] = "qualification";
    DocumentType["OTHER"] = "other";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
class UploadDocumentDto {
    type;
    description;
}
exports.UploadDocumentDto = UploadDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of document being uploaded',
        enum: DocumentType,
        example: DocumentType.ID_PROOF,
    }),
    (0, class_validator_1.IsEnum)(DocumentType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional description or notes about the document',
        required: false,
        example: 'Aadhaar card copy for identity verification',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadDocumentDto.prototype, "description", void 0);
class DocumentResponseDto {
    id;
    type;
    fileName;
    fileUrl;
    fileSize;
    mimeType;
    status;
    description;
    createdAt;
    updatedAt;
}
exports.DocumentResponseDto = DocumentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier of the document',
        example: 'uuid-string',
    }),
    __metadata("design:type", String)
], DocumentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of document',
        enum: DocumentType,
        example: DocumentType.ID_PROOF,
    }),
    __metadata("design:type", String)
], DocumentResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Original filename of the uploaded document',
        example: 'aadhaar_card.pdf',
    }),
    __metadata("design:type", String)
], DocumentResponseDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'URL to access the document',
        example: '/api/documents/download/uuid-string',
    }),
    __metadata("design:type", String)
], DocumentResponseDto.prototype, "fileUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'File size in bytes',
        example: 1024000,
    }),
    __metadata("design:type", Number)
], DocumentResponseDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'MIME type of the file',
        example: 'application/pdf',
    }),
    __metadata("design:type", String)
], DocumentResponseDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current status of the document',
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        example: 'PENDING',
    }),
    __metadata("design:type", String)
], DocumentResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional description provided during upload',
        required: false,
        example: 'Identity proof document',
    }),
    __metadata("design:type", String)
], DocumentResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Upload timestamp',
        example: '2023-01-01T00:00:00Z',
    }),
    __metadata("design:type", Date)
], DocumentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2023-01-01T00:00:00Z',
    }),
    __metadata("design:type", Date)
], DocumentResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=upload-document.dto.js.map