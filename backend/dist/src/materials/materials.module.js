"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsModule = void 0;
const common_1 = require("@nestjs/common");
const materials_controller_1 = require("./materials.controller");
const materials_service_1 = require("./materials.service");
const prisma_module_1 = require("../prisma/prisma.module");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let MaterialsModule = class MaterialsModule {
};
exports.MaterialsModule = MaterialsModule;
exports.MaterialsModule = MaterialsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: './uploads/materials',
                    filename: (req, file, callback) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        callback(null, `${file.fieldname}-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
                    },
                }),
                fileFilter: (req, file, callback) => {
                    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.png', '.jpg', '.jpeg', '.mp4', '.avi'];
                    const ext = (0, path_1.extname)(file.originalname).toLowerCase();
                    if (allowedExtensions.includes(ext)) {
                        callback(null, true);
                    }
                    else {
                        callback(new Error('Invalid file type'), false);
                    }
                },
                limits: {
                    fileSize: 50 * 1024 * 1024,
                },
            }),
        ],
        controllers: [materials_controller_1.MaterialsController],
        providers: [materials_service_1.MaterialsService],
        exports: [materials_service_1.MaterialsService],
    })
], MaterialsModule);
//# sourceMappingURL=materials.module.js.map