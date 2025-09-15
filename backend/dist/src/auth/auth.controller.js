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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const jwt_refresh_guard_1 = require("./guards/jwt-refresh.guard");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const email_service_1 = require("../email/email.service");
let AuthController = class AuthController {
    authService;
    emailService;
    constructor(authService, emailService) {
        this.authService = authService;
        this.emailService = emailService;
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async logout(user) {
        return this.authService.logout(user.id);
    }
    async refresh(req) {
        const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();
        return this.authService.refreshTokens(req.user.id, refreshToken);
    }
    async getProfile(user) {
        return user;
    }
    async changePassword(user, changePasswordDto) {
        return this.authService.changePassword(user.id, changePasswordDto.oldPassword, changePasswordDto.newPassword);
    }
    async verifyEmail(token) {
        return this.authService.verifyEmail(token);
    }
    async resendVerification(email) {
        return this.authService.resendVerificationEmail(email);
    }
    async testEmail(body) {
        const testEmail = body.to || 'harshal.baviskar@balsampada.com';
        const emailType = body.type || 'simple';
        try {
            let result;
            if (emailType === 'simple') {
                result = await this.emailService.sendEmail({
                    to: testEmail,
                    subject: '🎉 Test Email from Balsampada Tuition LMS',
                    html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .success { color: #10B981; font-size: 24px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1 class="success">✅ Email Working!</h1>
                  <p>Congratulations! Your Zoho Mail integration is working perfectly.</p>
                  <hr>
                  <p><strong>Email Details:</strong></p>
                  <ul>
                    <li>From: harshal.baviskar@balsampada.com</li>
                    <li>To: ${testEmail}</li>
                    <li>Time: ${new Date().toLocaleString()}</li>
                    <li>SMTP: smtp.zoho.in:587</li>
                  </ul>
                  <p>Your Tuition LMS email service is ready to send notifications!</p>
                </div>
              </body>
            </html>
          `
                });
            }
            else if (emailType === 'verification') {
                result = await this.emailService.sendVerificationEmail(testEmail, 'Test User', 'test-token-123456');
            }
            else if (emailType === 'password') {
                result = await this.emailService.sendPasswordResetEmail(testEmail, 'Test User', 'reset-token-123456');
            }
            else if (emailType === 'payment') {
                result = await this.emailService.sendPaymentConfirmationEmail(testEmail, 'Test User', 5000, 'APPROVED', 'Monthly Fee');
            }
            if (result) {
                return {
                    success: true,
                    message: `✅ Test email sent successfully!`,
                    details: {
                        to: testEmail,
                        type: emailType,
                        timestamp: new Date().toISOString()
                    },
                    note: 'Check your inbox (and spam folder) for the email'
                };
            }
            else {
                return {
                    success: false,
                    message: '❌ Email sending failed',
                    hint: 'Check server logs for details'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: '❌ Email test failed',
                error: error.message,
                possibleIssues: [
                    'Check if SMTP access is enabled in Zoho',
                    'Verify password is correct in .env',
                    'Try using port 465 with secure: true',
                    'Check if 2FA is enabled (use app-specific password)'
                ]
            };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('logout'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_refresh_guard_1.JwtRefreshGuard),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('change-password'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('verify-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
__decorate([
    (0, common_1.Post)('test-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "testEmail", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        email_service_1.EmailService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map