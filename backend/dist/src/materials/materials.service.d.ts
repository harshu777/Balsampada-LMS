import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';
export declare class MaterialsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createMaterialDto: CreateMaterialDto, file: Express.Multer.File, userId: string): Promise<{
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
    findAll(subjectId?: string, userId?: string, userRole?: string): Promise<({
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
    findOne(id: string, userId: string, userRole: string): Promise<{
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
    update(id: string, updateMaterialDto: UpdateMaterialDto, userId: string): Promise<{
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
    remove(id: string, userId: string, userRole: string): Promise<{
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
