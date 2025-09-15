"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileUploadConfig = exports.documentUploadConfig = exports.UPLOAD_PATHS = exports.FILE_SIZE_LIMITS = exports.ALLOWED_FILE_TYPES = void 0;
exports.createDocumentStorage = createDocumentStorage;
exports.createProfileStorage = createProfileStorage;
exports.validateFileContent = validateFileContent;
exports.getFileCategory = getFileCategory;
exports.formatFileSize = formatFileSize;
exports.generateFileUrl = generateFileUrl;
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
exports.ALLOWED_FILE_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};
exports.FILE_SIZE_LIMITS = {
    DEFAULT: 5 * 1024 * 1024,
    IMAGE: 2 * 1024 * 1024,
    DOCUMENT: 10 * 1024 * 1024,
};
exports.UPLOAD_PATHS = {
    DOCUMENTS: 'uploads/documents',
    PROFILES: 'uploads/profiles',
    MATERIALS: 'uploads/materials',
    ASSIGNMENTS: 'uploads/assignments',
};
function ensureUploadDir(uploadPath) {
    if (!(0, fs_1.existsSync)(uploadPath)) {
        (0, fs_1.mkdirSync)(uploadPath, { recursive: true });
    }
}
function generateFilename(originalname) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const fileExtension = (0, path_1.extname)(originalname).toLowerCase();
    const baseName = originalname.replace(fileExtension, '').replace(/[^a-zA-Z0-9]/g, '_');
    return `${timestamp}_${randomString}_${baseName}${fileExtension}`;
}
function createFileFilter(allowedTypes) {
    return (req, file, callback) => {
        const allowedMimeTypes = allowedTypes || Object.keys(exports.ALLOWED_FILE_TYPES);
        const fileExtension = (0, path_1.extname)(file.originalname).toLowerCase();
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(new common_1.BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
        }
        const allowedExtensions = exports.ALLOWED_FILE_TYPES[file.mimetype];
        if (!allowedExtensions?.includes(fileExtension)) {
            return callback(new common_1.BadRequestException(`File extension ${fileExtension} is not allowed for MIME type ${file.mimetype}`), false);
        }
        callback(null, true);
    };
}
function createDocumentStorage(subPath = '') {
    const uploadPath = (0, path_1.join)(process.cwd(), exports.UPLOAD_PATHS.DOCUMENTS, subPath);
    ensureUploadDir(uploadPath);
    return (0, multer_1.diskStorage)({
        destination: (req, file, callback) => {
            callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
            const filename = generateFilename(file.originalname);
            callback(null, filename);
        },
    });
}
function createProfileStorage() {
    const uploadPath = (0, path_1.join)(process.cwd(), exports.UPLOAD_PATHS.PROFILES);
    ensureUploadDir(uploadPath);
    return (0, multer_1.diskStorage)({
        destination: (req, file, callback) => {
            callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
            const filename = generateFilename(file.originalname);
            callback(null, filename);
        },
    });
}
exports.documentUploadConfig = {
    storage: createDocumentStorage(),
    limits: {
        fileSize: exports.FILE_SIZE_LIMITS.DEFAULT,
        files: 5,
    },
    fileFilter: createFileFilter(),
};
exports.profileUploadConfig = {
    storage: createProfileStorage(),
    limits: {
        fileSize: exports.FILE_SIZE_LIMITS.IMAGE,
        files: 1,
    },
    fileFilter: createFileFilter(['image/jpeg', 'image/png']),
};
function validateFileContent(file) {
    if (file.size === 0) {
        return false;
    }
    const suspiciousPatterns = /\.(exe|bat|cmd|scr|pif|vbs|js)$/i;
    if (suspiciousPatterns.test(file.originalname)) {
        return false;
    }
    return true;
}
function getFileCategory(mimeType) {
    if (mimeType.startsWith('image/'))
        return 'image';
    if (mimeType === 'application/pdf')
        return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document'))
        return 'document';
    return 'other';
}
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function generateFileUrl(req, filePath) {
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
    return `${baseUrl}${relativePath}`;
}
//# sourceMappingURL=upload.config.js.map