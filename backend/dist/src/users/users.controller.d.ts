import { UsersService } from './users.service';
import { UserStatus } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getStudents(status?: UserStatus): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        address: string | null;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLogin: Date | null;
        createdAt: Date;
        documents: {
            id: string;
            status: import("@prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            type: string;
            fileUrl: string;
        }[];
    }[]>;
    getTeachers(status?: UserStatus): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        address: string | null;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLogin: Date | null;
        createdAt: Date;
        documents: {
            id: string;
            status: import("@prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            type: string;
            fileUrl: string;
        }[];
    }[]>;
    getStats(): Promise<{
        students: {
            total: number;
            pending: number;
        };
        teachers: {
            total: number;
            pending: number;
        };
    }>;
    getUserById(id: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        address: string | null;
        role: import("@prisma/client").$Enums.Role;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
        lastLogin: Date | null;
        createdAt: Date;
        documents: {
            id: string;
            status: import("@prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            fileUrl: string;
            reviewNotes: string | null;
        }[];
        studentPayments: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            amount: number;
            dueDate: Date | null;
        }[];
    }>;
    updateUserStatus(id: string, status: UserStatus, remarks?: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        id: string;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
}
