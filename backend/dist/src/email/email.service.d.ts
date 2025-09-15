import { ConfigService } from '@nestjs/config';
interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}
export declare class EmailService {
    private configService;
    private transporter;
    private readonly logger;
    private readonly fromEmail;
    private readonly appName;
    constructor(configService: ConfigService);
    private verifyConnection;
    sendEmail(options: EmailOptions): Promise<boolean>;
    private stripHtml;
    sendVerificationEmail(email: string, name: string, token: string): Promise<boolean>;
    sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean>;
    sendApprovalEmail(email: string, name: string, status: 'APPROVED' | 'REJECTED', reason?: string): Promise<boolean>;
    sendPaymentConfirmationEmail(email: string, name: string, amount: number, status: 'APPROVED' | 'REJECTED', paymentType: string, reason?: string): Promise<boolean>;
    sendClassReminderEmail(emails: string[], className: string, teacherName: string, startTime: Date): Promise<boolean>;
    sendWelcomeBackEmail(email: string, name: string, role: string): Promise<boolean>;
}
export {};
