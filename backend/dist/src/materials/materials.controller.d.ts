import { MaterialsService } from './materials.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';
export declare class MaterialsController {
    private readonly materialsService;
    constructor(materialsService: MaterialsService);
    create(createMaterialDto: CreateMaterialDto, file: Express.Multer.File, req: any): Promise<{
        subject: {
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                academicYear: string | null;
                isActive: boolean;
                grade: string | null;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            classId: string;
        };
        uploadedBy: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string | null;
        title: string;
        fileName: string | null;
        fileUrl: string | null;
        fileSize: number | null;
        content: string | null;
        subjectId: string;
        isActive: boolean;
        fileType: string | null;
        uploadedById: string;
        downloadCount: number;
    }>;
    findAll(subjectId: string, req: any): Promise<({
        subject: {
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                academicYear: string | null;
                isActive: boolean;
                grade: string | null;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            classId: string;
        };
        uploadedBy: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string | null;
        title: string;
        fileName: string | null;
        fileUrl: string | null;
        fileSize: number | null;
        content: string | null;
        subjectId: string;
        isActive: boolean;
        fileType: string | null;
        uploadedById: string;
        downloadCount: number;
    })[]>;
    findOne(id: string, req: any): Promise<{
        subject: {
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                academicYear: string | null;
                isActive: boolean;
                grade: string | null;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            classId: string;
        };
        uploadedBy: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string | null;
        title: string;
        fileName: string | null;
        fileUrl: string | null;
        fileSize: number | null;
        content: string | null;
        subjectId: string;
        isActive: boolean;
        fileType: string | null;
        uploadedById: string;
        downloadCount: number;
    }>;
    update(id: string, updateMaterialDto: UpdateMaterialDto, req: any): Promise<{
        subject: {
            class: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                academicYear: string | null;
                isActive: boolean;
                grade: string | null;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
            classId: string;
        };
        uploadedBy: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string | null;
        title: string;
        fileName: string | null;
        fileUrl: string | null;
        fileSize: number | null;
        content: string | null;
        subjectId: string;
        isActive: boolean;
        fileType: string | null;
        uploadedById: string;
        downloadCount: number;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string | null;
        title: string;
        fileName: string | null;
        fileUrl: string | null;
        fileSize: number | null;
        content: string | null;
        subjectId: string;
        isActive: boolean;
        fileType: string | null;
        uploadedById: string;
        downloadCount: number;
    }>;
}
