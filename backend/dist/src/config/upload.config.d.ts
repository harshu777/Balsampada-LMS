import { Request } from 'express';
export interface FileUploadConfig {
    destination: string;
    filename: string;
    limits: {
        fileSize: number;
        files: number;
    };
    fileFilter: (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
}
export declare const ALLOWED_FILE_TYPES: {
    'image/jpeg': string[];
    'image/png': string[];
    'application/pdf': string[];
    'application/msword': string[];
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': string[];
};
export declare const FILE_SIZE_LIMITS: {
    DEFAULT: number;
    IMAGE: number;
    DOCUMENT: number;
};
export declare const UPLOAD_PATHS: {
    DOCUMENTS: string;
    PROFILES: string;
    MATERIALS: string;
    ASSIGNMENTS: string;
};
export declare function createDocumentStorage(subPath?: string): any;
export declare function createProfileStorage(): any;
export declare const documentUploadConfig: {
    storage: any;
    limits: {
        fileSize: number;
        files: number;
    };
    fileFilter: (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
};
export declare const profileUploadConfig: {
    storage: any;
    limits: {
        fileSize: number;
        files: number;
    };
    fileFilter: (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
};
export declare function validateFileContent(file: Express.Multer.File): boolean;
export declare function getFileCategory(mimeType: string): string;
export declare function formatFileSize(bytes: number): string;
export declare function generateFileUrl(req: Request, filePath: string): string;
