import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
export declare class AuthController {
    private authService;
    private emailService;
    constructor(authService: AuthService, emailService: EmailService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
        user: {
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
            status: import("@prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            status: "APPROVED";
        };
    }>;
    logout(user: any): Promise<{
        message: string;
    }>;
    refresh(req: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(user: any): Promise<any>;
    changePassword(user: any, changePasswordDto: {
        oldPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
        user: {
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.Role;
            id: string;
            status: import("@prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
        };
    }>;
    resendVerification(email: string): Promise<{
        message: string;
    }>;
    testEmail(body: {
        to?: string;
        type?: string;
    }): Promise<{
        success: boolean;
        message: string;
        details: {
            to: string;
            type: string;
            timestamp: string;
        };
        note: string;
        hint?: undefined;
        error?: undefined;
        possibleIssues?: undefined;
    } | {
        success: boolean;
        message: string;
        hint: string;
        details?: undefined;
        note?: undefined;
        error?: undefined;
        possibleIssues?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        possibleIssues: string[];
        details?: undefined;
        note?: undefined;
        hint?: undefined;
    }>;
}
