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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = EmailService_1 = class EmailService {
    configService;
    transporter;
    logger = new common_1.Logger(EmailService_1.name);
    fromEmail;
    appName = 'Balsampada';
    constructor(configService) {
        this.configService = configService;
        this.fromEmail = this.configService.get('MAIL_FROM') || 'noreply@tuitionlms.com';
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('MAIL_HOST') || 'smtp.gmail.com',
            port: this.configService.get('MAIL_PORT') || 587,
            secure: false,
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASSWORD'),
            },
        });
        this.verifyConnection();
    }
    async verifyConnection() {
        try {
            await this.transporter.verify();
            this.logger.log('Email service is ready to send emails');
        }
        catch (error) {
            this.logger.error('Email service configuration error:', error);
        }
    }
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: `"${this.appName}" <${this.fromEmail}>`,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                text: options.text || this.stripHtml(options.html),
                html: options.html,
            };
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent successfully: ${info.messageId}`);
            return true;
        }
        catch (error) {
            this.logger.error('Failed to send email:', error);
            return false;
        }
    }
    stripHtml(html) {
        return html.replace(/<[^>]*>?/gm, '');
    }
    async sendVerificationEmail(email, name, token) {
        const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
        const logoUrl = `${this.configService.get('FRONTEND_URL')}/logo.png`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f7fafc;
              margin: 0;
              padding: 40px 20px;
            }
            .container { 
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 
                0 4px 6px rgba(0, 0, 0, 0.05),
                0 10px 15px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: #ffffff;
              padding: 48px 32px 32px;
              text-align: center;
              border-bottom: 1px solid #e2e8f0;
            }
            .logo-container {
              display: inline-block;
              padding: 20px;
              background: #f7fafc;
              border-radius: 20px;
              margin-bottom: 24px;
              box-shadow: 
                inset 3px 3px 6px #d1d9e6,
                inset -3px -3px 6px #ffffff;
            }
            .logo {
              width: 120px;
              height: auto;
              display: block;
            }
            .title {
              color: #2d3748;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            .subtitle {
              color: #718096;
              font-size: 16px;
              font-weight: 400;
            }
            .content { 
              padding: 40px 32px;
            }
            .info-box {
              background: #edf2f7;
              border-radius: 16px;
              padding: 24px;
              margin: 32px 0;
              box-shadow: 
                inset 2px 2px 4px rgba(0, 0, 0, 0.06),
                inset -2px -2px 4px rgba(255, 255, 255, 0.5);
            }
            .button-container {
              text-align: center;
              margin: 36px 0;
            }
            .button { 
              display: inline-block;
              padding: 14px 32px;
              background: #48bb78;
              color: white;
              text-decoration: none;
              border-radius: 16px;
              font-weight: 600;
              font-size: 15px;
              box-shadow: 
                0 4px 14px rgba(72, 187, 120, 0.25),
                0 2px 4px rgba(72, 187, 120, 0.15);
              transition: all 0.3s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 
                0 6px 20px rgba(72, 187, 120, 0.3),
                0 4px 8px rgba(72, 187, 120, 0.2);
            }
            .link-box {
              background: #f7fafc;
              padding: 16px;
              border-radius: 12px;
              margin: 20px 0;
              word-break: break-all;
              color: #4a5568;
              font-size: 13px;
              border: 1px solid #e2e8f0;
            }
            .security-note {
              background: #fef5e7;
              border-left: 4px solid #f6ad55;
              padding: 16px;
              border-radius: 8px;
              margin-top: 32px;
            }
            .security-text {
              margin: 0;
              color: #744210;
              font-size: 14px;
            }
            .footer { 
              background: #f7fafc;
              padding: 32px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer-logo {
              width: 60px;
              height: auto;
              margin-bottom: 16px;
              opacity: 0.6;
            }
            .footer-text {
              color: #718096;
              font-size: 13px;
              line-height: 1.6;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-link {
              display: inline-block;
              margin: 0 12px;
              color: #a0aec0;
              text-decoration: none;
              font-size: 13px;
            }
            .social-link:hover {
              color: #48bb78;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <img src="${logoUrl}" alt="Tuition LMS" class="logo" />
              </div>
              <h1 class="title">Verify Your Email</h1>
              <p class="subtitle">Just one more step to get started</p>
            </div>
            <div class="content">
              <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">Hi ${name},</p>
              <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                Thank you for joining Balsampada! We're excited to have you as part of our learning community.
                Please verify your email address to activate your account.
              </p>
              
              <div class="button-container">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <div class="info-box">
                <p style="margin: 0 0 12px 0; color: #2d3748; font-weight: 600; font-size: 14px;">
                  Can't click the button?
                </p>
                <p style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px;">
                  Copy and paste this link in your browser:
                </p>
                <div class="link-box">${verificationUrl}</div>
                <p style="margin: 12px 0 0 0; color: #718096; font-size: 13px;">
                  This link will expire in 24 hours
                </p>
              </div>
              
              <div class="security-note">
                <p class="security-text">
                  <strong>Security Note:</strong> If you didn't create an account with Balsampada, please ignore this email.
                </p>
              </div>
            </div>
            <div class="footer">
              <img src="${logoUrl}" alt="Tuition LMS" class="footer-logo" />
              <div class="footer-text">
                <p style="margin: 5px 0; color: #4a5568;">© 2024 Balsampada. All rights reserved.</p>
                <p style="margin: 5px 0;">Empowering Education, Transforming Lives</p>
              </div>
              <div class="social-links">
                <a href="#" class="social-link">Website</a>
                <a href="#" class="social-link">Support</a>
                <a href="#" class="social-link">Privacy</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: email,
            subject: `Verify Your Email - ${this.appName}`,
            html,
        });
    }
    async sendPasswordResetEmail(email, name, token) {
        const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
        const logoUrl = `${this.configService.get('FRONTEND_URL')}/logo.png`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f7fafc;
              margin: 0;
              padding: 40px 20px;
            }
            .container { 
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 
                0 4px 6px rgba(0, 0, 0, 0.05),
                0 10px 15px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: #ffffff;
              padding: 48px 32px 32px;
              text-align: center;
              border-bottom: 1px solid #e2e8f0;
            }
            .logo-container {
              display: inline-block;
              padding: 20px;
              background: #f7fafc;
              border-radius: 20px;
              margin-bottom: 24px;
              box-shadow: 
                inset 3px 3px 6px #d1d9e6,
                inset -3px -3px 6px #ffffff;
            }
            .logo {
              width: 120px;
              height: auto;
              display: block;
            }
            .alert-icon {
              width: 64px;
              height: 64px;
              margin: 0 auto 20px;
              background: #fed7d7;
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              box-shadow: 
                inset 2px 2px 4px rgba(0, 0, 0, 0.06),
                inset -2px -2px 4px rgba(255, 255, 255, 0.5);
            }
            .title {
              color: #2d3748;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            .subtitle {
              color: #718096;
              font-size: 16px;
              font-weight: 400;
            }
            .content { 
              padding: 40px 32px;
            }
            .info-box {
              background: #edf2f7;
              border-radius: 16px;
              padding: 24px;
              margin: 32px 0;
              box-shadow: 
                inset 2px 2px 4px rgba(0, 0, 0, 0.06),
                inset -2px -2px 4px rgba(255, 255, 255, 0.5);
            }
            .button-container {
              text-align: center;
              margin: 36px 0;
            }
            .button { 
              display: inline-block;
              padding: 14px 32px;
              background: #e53e3e;
              color: white;
              text-decoration: none;
              border-radius: 16px;
              font-weight: 600;
              font-size: 15px;
              box-shadow: 
                0 4px 14px rgba(229, 62, 62, 0.25),
                0 2px 4px rgba(229, 62, 62, 0.15);
              transition: all 0.3s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 
                0 6px 20px rgba(229, 62, 62, 0.3),
                0 4px 8px rgba(229, 62, 62, 0.2);
            }
            .link-box {
              background: #f7fafc;
              padding: 16px;
              border-radius: 12px;
              margin: 20px 0;
              word-break: break-all;
              color: #4a5568;
              font-size: 13px;
              border: 1px solid #e2e8f0;
            }
            .security-note {
              background: #e6f7ff;
              border-left: 4px solid #4299e1;
              padding: 16px;
              border-radius: 8px;
              margin-top: 32px;
            }
            .security-list {
              margin: 12px 0 0 0;
              padding-left: 20px;
              color: #4a5568;
              font-size: 14px;
            }
            .security-list li {
              margin: 6px 0;
            }
            .footer { 
              background: #f7fafc;
              padding: 32px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer-logo {
              width: 60px;
              height: auto;
              margin-bottom: 16px;
              opacity: 0.6;
            }
            .footer-text {
              color: #718096;
              font-size: 13px;
              line-height: 1.6;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-link {
              display: inline-block;
              margin: 0 12px;
              color: #a0aec0;
              text-decoration: none;
              font-size: 13px;
            }
            .social-link:hover {
              color: #e53e3e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <img src="${logoUrl}" alt="Tuition LMS" class="logo" />
              </div>
              <div class="alert-icon">🔐</div>
              <h1 class="title">Password Reset Request</h1>
              <p class="subtitle">Let's get you back into your account</p>
            </div>
            <div class="content">
              <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">Hi ${name},</p>
              <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                We received a request to reset the password for your Balsampada account. 
                Click the button below to create a new password.
              </p>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="info-box">
                <p style="margin: 0 0 12px 0; color: #2d3748; font-weight: 600; font-size: 14px;">
                  Can't click the button?
                </p>
                <p style="margin: 0 0 12px 0; color: #4a5568; font-size: 14px;">
                  Copy and paste this link in your browser:
                </p>
                <div class="link-box">${resetUrl}</div>
                <p style="margin: 12px 0 0 0; color: #718096; font-size: 13px;">
                  This link will expire in 1 hour for security reasons
                </p>
              </div>
              
              <div class="security-note">
                <p style="margin: 0; color: #2b6cb0; font-size: 14px;">
                  <strong>Security Tips:</strong>
                </p>
                <ul class="security-list">
                  <li>Choose a strong, unique password</li>
                  <li>Never share your password with anyone</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <img src="${logoUrl}" alt="Tuition LMS" class="footer-logo" />
              <div class="footer-text">
                <p style="margin: 5px 0; color: #4a5568;">© 2024 Balsampada. All rights reserved.</p>
                <p style="margin: 5px 0;">Your account security is our priority</p>
              </div>
              <div class="social-links">
                <a href="#" class="social-link">Website</a>
                <a href="#" class="social-link">Support</a>
                <a href="#" class="social-link">Privacy</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: email,
            subject: `Password Reset - ${this.appName}`,
            html,
        });
    }
    async sendApprovalEmail(email, name, status, reason) {
        const isApproved = status === 'APPROVED';
        const loginUrl = `${this.configService.get('FRONTEND_URL')}/login`;
        const logoUrl = `${this.configService.get('FRONTEND_URL')}/logo.png`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f7fafc;
              margin: 0;
              padding: 40px 20px;
            }
            .container { 
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 
                0 4px 6px rgba(0, 0, 0, 0.05),
                0 10px 15px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: #ffffff;
              padding: 48px 32px 32px;
              text-align: center;
              border-bottom: 1px solid #e2e8f0;
            }
            .logo-container {
              display: inline-block;
              padding: 20px;
              background: #f7fafc;
              border-radius: 20px;
              margin-bottom: 24px;
              box-shadow: 
                inset 3px 3px 6px #d1d9e6,
                inset -3px -3px 6px #ffffff;
            }
            .logo {
              width: 120px;
              height: auto;
              display: block;
            }
            .status-icon {
              width: 64px;
              height: 64px;
              margin: 0 auto 20px;
              background: ${isApproved ? '#c6f6d5' : '#fed7d7'};
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
              box-shadow: 
                inset 2px 2px 4px rgba(0, 0, 0, 0.06),
                inset -2px -2px 4px rgba(255, 255, 255, 0.5);
            }
            .title {
              color: #2d3748;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            .subtitle {
              color: #718096;
              font-size: 16px;
              font-weight: 400;
            }
            .content { 
              padding: 40px 32px;
            }
            .info-box {
              background: ${isApproved ? '#f0fdf4' : '#fef2f2'};
              border-radius: 16px;
              padding: 24px;
              margin: 32px 0;
              border: 1px solid ${isApproved ? '#bbf7d0' : '#fecaca'};
            }
            .button-container {
              text-align: center;
              margin: 36px 0;
            }
            .button { 
              display: inline-block;
              padding: 14px 32px;
              background: ${isApproved ? '#48bb78' : '#805ad5'};
              color: white;
              text-decoration: none;
              border-radius: 16px;
              font-weight: 600;
              font-size: 15px;
              box-shadow: 
                0 4px 14px rgba(${isApproved ? '72, 187, 120' : '128, 90, 213'}, 0.25),
                0 2px 4px rgba(${isApproved ? '72, 187, 120' : '128, 90, 213'}, 0.15);
              transition: all 0.3s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 
                0 6px 20px rgba(${isApproved ? '72, 187, 120' : '128, 90, 213'}, 0.3),
                0 4px 8px rgba(${isApproved ? '72, 187, 120' : '128, 90, 213'}, 0.2);
            }
            .reason-box {
              background: #fef2f2;
              border-left: 4px solid #fc8181;
              padding: 16px;
              border-radius: 8px;
              margin-top: 24px;
            }
            .action-list {
              margin: 12px 0 0 0;
              padding-left: 20px;
              color: #4a5568;
              font-size: 14px;
            }
            .action-list li {
              margin: 6px 0;
            }
            .footer { 
              background: #f7fafc;
              padding: 32px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer-logo {
              width: 60px;
              height: auto;
              margin-bottom: 16px;
              opacity: 0.6;
            }
            .footer-text {
              color: #718096;
              font-size: 13px;
              line-height: 1.6;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-link {
              display: inline-block;
              margin: 0 12px;
              color: #a0aec0;
              text-decoration: none;
              font-size: 13px;
            }
            .social-link:hover {
              color: ${isApproved ? '#48bb78' : '#805ad5'};
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <img src="${logoUrl}" alt="Tuition LMS" class="logo" />
              </div>
              <div class="status-icon">${isApproved ? '✓' : '✕'}</div>
              <h1 class="title">Account ${isApproved ? 'Approved' : 'Review Required'}</h1>
              <p class="subtitle">${isApproved ? 'Welcome to our learning community' : 'Additional information needed'}</p>
            </div>
            <div class="content">
              <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">Hi ${name},</p>
              ${isApproved ? `
                <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                  Great news! Your account has been approved by our team. 
                  You now have full access to all features of Balsampada.
                </p>
                
                <div class="info-box">
                  <h3 style="margin: 0 0 12px 0; color: #22543d; font-size: 16px;">
                    You're all set!
                  </h3>
                  <p style="margin: 0; color: #4a5568; font-size: 14px;">
                    Start exploring courses, connect with teachers, and begin your learning journey.
                  </p>
                </div>
                
                <div class="button-container">
                  <a href="${loginUrl}" class="button">Login to Your Account</a>
                </div>
              ` : `
                <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                  We've reviewed your account registration and need some additional information before we can approve it.
                </p>
                
                ${reason ? `
                  <div class="reason-box">
                    <p style="margin: 0; color: #742a2a; font-size: 14px;">
                      <strong>Feedback from our team:</strong><br/>
                      <span style="color: #4a5568; margin-top: 8px; display: block;">${reason}</span>
                    </p>
                  </div>
                ` : ''}
                
                <div class="info-box">
                  <h3 style="margin: 0 0 12px 0; color: #742a2a; font-size: 16px;">
                    Next Steps
                  </h3>
                  <ul class="action-list">
                    <li>Review the feedback provided above</li>
                    <li>Contact our support team for clarification</li>
                    <li>Submit updated information as requested</li>
                  </ul>
                </div>
                
                <div class="button-container">
                  <a href="mailto:support@balsampada.com" class="button">Contact Support</a>
                </div>
              `}
            </div>
            <div class="footer">
              <img src="${logoUrl}" alt="Tuition LMS" class="footer-logo" />
              <div class="footer-text">
                <p style="margin: 5px 0; color: #4a5568;">© 2024 Balsampada. All rights reserved.</p>
                <p style="margin: 5px 0;">${isApproved ? 'Welcome to our community!' : 'We\'re here to help'}</p>
              </div>
              <div class="social-links">
                <a href="#" class="social-link">Website</a>
                <a href="#" class="social-link">Support</a>
                <a href="#" class="social-link">Privacy</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: email,
            subject: `Account ${status} - ${this.appName}`,
            html,
        });
    }
    async sendPaymentConfirmationEmail(email, name, amount, status, paymentType, reason) {
        const isApproved = status === 'APPROVED';
        const logoUrl = `${this.configService.get('FRONTEND_URL')}/logo.png`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f7fafc;
              margin: 0;
              padding: 40px 20px;
            }
            .container { 
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 
                0 4px 6px rgba(0, 0, 0, 0.05),
                0 10px 15px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: #ffffff;
              padding: 48px 32px 32px;
              text-align: center;
              border-bottom: 1px solid #e2e8f0;
            }
            .logo-container {
              display: inline-block;
              padding: 20px;
              background: #f7fafc;
              border-radius: 20px;
              margin-bottom: 24px;
              box-shadow: 
                inset 3px 3px 6px #d1d9e6,
                inset -3px -3px 6px #ffffff;
            }
            .logo {
              width: 120px;
              height: auto;
              display: block;
            }
            .title {
              color: #2d3748;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            .subtitle {
              color: #718096;
              font-size: 16px;
              font-weight: 400;
            }
            .content { 
              padding: 40px 32px;
            }
            .receipt-container {
              background: #f7fafc;
              border-radius: 16px;
              padding: 24px;
              margin: 32px 0;
              border: 2px dashed #cbd5e0;
              box-shadow: 
                inset 2px 2px 4px rgba(0, 0, 0, 0.04),
                inset -2px -2px 4px rgba(255, 255, 255, 0.5);
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 16px;
              border-bottom: 1px solid #e2e8f0;
            }
            .receipt-title {
              font-size: 20px;
              font-weight: 600;
              color: #2d3748;
              margin-bottom: 8px;
            }
            .receipt-status {
              display: inline-block;
              padding: 6px 16px;
              background: ${isApproved ? '#c6f6d5' : '#fed7d7'};
              color: ${isApproved ? '#22543d' : '#742a2a'};
              border-radius: 12px;
              font-size: 13px;
              font-weight: 600;
            }
            .receipt-details {
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              color: #718096;
              font-size: 14px;
            }
            .detail-value {
              color: #2d3748;
              font-weight: 600;
              font-size: 14px;
            }
            .amount-row {
              background: ${isApproved ? '#48bb78' : '#e53e3e'};
              color: white;
              border-radius: 12px;
              padding: 20px;
              margin-top: 20px;
              box-shadow: 
                0 4px 14px rgba(${isApproved ? '72, 187, 120' : '229, 62, 62'}, 0.25),
                0 2px 4px rgba(${isApproved ? '72, 187, 120' : '229, 62, 62'}, 0.15);
            }
            .amount-label {
              font-size: 14px;
              opacity: 0.95;
            }
            .amount-value {
              font-size: 24px;
              font-weight: 700;
            }
            .message-box {
              background: ${isApproved ? '#f0fdf4' : '#fef2f2'};
              border-left: 4px solid ${isApproved ? '#48bb78' : '#fc8181'};
              padding: 16px;
              border-radius: 8px;
              margin: 24px 0;
            }
            .footer { 
              background: #f7fafc;
              padding: 32px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer-logo {
              width: 60px;
              height: auto;
              margin-bottom: 16px;
              opacity: 0.6;
            }
            .footer-text {
              color: #718096;
              font-size: 13px;
              line-height: 1.6;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-link {
              display: inline-block;
              margin: 0 12px;
              color: #a0aec0;
              text-decoration: none;
              font-size: 13px;
            }
            .social-link:hover {
              color: #805ad5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <img src="${logoUrl}" alt="Tuition LMS" class="logo" />
              </div>
              <h1 class="title">Payment Receipt</h1>
              <p class="subtitle">Transaction Details</p>
            </div>
            <div class="content">
              <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">Hi ${name},</p>
              <p style="color: #4a5568; font-size: 15px; line-height: 1.6;">
                ${isApproved ?
            'Your payment has been successfully processed and approved.' :
            'We were unable to process your payment at this time.'}
              </p>
              
              <div class="receipt-container">
                <div class="receipt-header">
                  <div class="receipt-title">Payment Details</div>
                  <span class="receipt-status">${status}</span>
                </div>
                
                <div class="receipt-details">
                  <div class="detail-row">
                    <span class="detail-label">Payment Type:</span>
                    <span class="detail-value">${paymentType}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Transaction Date:</span>
                    <span class="detail-value">${new Date().toLocaleDateString()}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value" style="color: ${isApproved ? '#22543d' : '#742a2a'};">${status}</span>
                  </div>
                  ${!isApproved && reason ? `
                    <div class="detail-row">
                      <span class="detail-label">Reason:</span>
                      <span class="detail-value" style="color: #742a2a;">${reason}</span>
                    </div>
                  ` : ''}
                </div>
                
                <div class="amount-row">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="amount-label">Total Amount</span>
                    <span class="amount-value">₹ ${amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div class="message-box">
                <p style="margin: 0; color: ${isApproved ? '#22543d' : '#742a2a'}; font-size: 14px;">
                  ${isApproved ?
            '<strong>Payment Successful!</strong><br/><span style="color: #4a5568;">Thank you for your payment. Your transaction has been completed successfully.</span>' :
            '<strong>Payment Failed</strong><br/><span style="color: #4a5568;">Please contact our support team for assistance or try again with a different payment method.</span>'}
                </p>
              </div>
              
              ${isApproved ? `
                <p style="color: #718096; font-size: 13px; text-align: center; margin-top: 30px;">
                  <em>A copy of this receipt has been saved to your account for your records.</em>
                </p>
              ` : ''}
            </div>
            <div class="footer">
              <img src="${logoUrl}" alt="Tuition LMS" class="footer-logo" />
              <div class="footer-text">
                <p style="margin: 5px 0; color: #4a5568;">© 2024 Balsampada. All rights reserved.</p>
                <p style="margin: 5px 0;">Thank you for choosing Balsampada</p>
              </div>
              <div class="social-links">
                <a href="#" class="social-link">Website</a>
                <a href="#" class="social-link">Support</a>
                <a href="#" class="social-link">Privacy</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: email,
            subject: `Payment ${status} - ${this.appName}`,
            html,
        });
    }
    async sendClassReminderEmail(emails, className, teacherName, startTime) {
        const logoUrl = `${this.configService.get('FRONTEND_URL')}/logo.png`;
        const dashboardUrl = `${this.configService.get('FRONTEND_URL')}/student/dashboard`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f7fafc;
              margin: 0;
              padding: 40px 20px;
            }
            .container { 
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 
                0 4px 6px rgba(0, 0, 0, 0.05),
                0 10px 15px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: #ffffff;
              padding: 48px 32px 32px;
              text-align: center;
              border-bottom: 1px solid #e2e8f0;
            }
            .logo-container {
              display: inline-block;
              padding: 20px;
              background: #f7fafc;
              border-radius: 20px;
              margin-bottom: 24px;
              box-shadow: 
                inset 3px 3px 6px #d1d9e6,
                inset -3px -3px 6px #ffffff;
            }
            .logo {
              width: 120px;
              height: auto;
              display: block;
            }
            .title {
              color: #2d3748;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            .subtitle {
              color: #718096;
              font-size: 16px;
              font-weight: 400;
            }
            .content { 
              padding: 40px 32px;
            }
            .alert-banner {
              background: #f6ad55;
              color: white;
              padding: 16px;
              border-radius: 12px;
              text-align: center;
              margin-bottom: 32px;
              font-size: 16px;
              font-weight: 600;
              box-shadow: 
                0 4px 14px rgba(246, 173, 85, 0.25),
                0 2px 4px rgba(246, 173, 85, 0.15);
            }
            .class-card {
              background: #f7fafc;
              border-radius: 16px;
              padding: 24px;
              margin: 32px 0;
              box-shadow: 
                inset 2px 2px 4px rgba(0, 0, 0, 0.06),
                inset -2px -2px 4px rgba(255, 255, 255, 0.5);
            }
            .class-title {
              font-size: 20px;
              font-weight: 600;
              color: #2d3748;
              margin-bottom: 20px;
            }
            .class-details {
              background: #ffffff;
              border-radius: 12px;
              padding: 16px;
              box-shadow: 
                2px 2px 6px rgba(0, 0, 0, 0.04),
                -2px -2px 6px rgba(255, 255, 255, 0.9);
            }
            .detail-item {
              display: flex;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .detail-item:last-child {
              border-bottom: none;
            }
            .detail-icon {
              width: 40px;
              height: 40px;
              background: #edf2f7;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 14px;
              font-size: 18px;
              box-shadow: 
                inset 2px 2px 4px rgba(0, 0, 0, 0.06),
                inset -2px -2px 4px rgba(255, 255, 255, 0.5);
            }
            .detail-content {
              flex: 1;
            }
            .detail-label {
              color: #718096;
              font-size: 13px;
              margin-bottom: 2px;
            }
            .detail-value {
              color: #2d3748;
              font-size: 15px;
              font-weight: 600;
            }
            .countdown-box {
              background: #fef5e7;
              border-left: 4px solid #f6ad55;
              padding: 20px;
              border-radius: 8px;
              margin: 24px 0;
              text-align: center;
            }
            .countdown-text {
              font-size: 18px;
              color: #744210;
              font-weight: 600;
            }
            .button-container {
              text-align: center;
              margin: 36px 0;
            }
            .button { 
              display: inline-block;
              padding: 14px 32px;
              background: #805ad5;
              color: white;
              text-decoration: none;
              border-radius: 16px;
              font-weight: 600;
              font-size: 15px;
              box-shadow: 
                0 4px 14px rgba(128, 90, 213, 0.25),
                0 2px 4px rgba(128, 90, 213, 0.15);
              transition: all 0.3s ease;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 
                0 6px 20px rgba(128, 90, 213, 0.3),
                0 4px 8px rgba(128, 90, 213, 0.2);
            }
            .tips-section {
              background: #edf2f7;
              border-radius: 12px;
              padding: 20px;
              margin-top: 32px;
              box-shadow: 
                inset 2px 2px 4px rgba(0, 0, 0, 0.06),
                inset -2px -2px 4px rgba(255, 255, 255, 0.5);
            }
            .tips-title {
              color: #2d3748;
              font-size: 15px;
              font-weight: 600;
              margin-bottom: 12px;
            }
            .tips-list {
              margin: 0;
              padding-left: 20px;
              color: #4a5568;
              font-size: 14px;
            }
            .tips-list li {
              margin: 6px 0;
            }
            .footer { 
              background: #f7fafc;
              padding: 32px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer-logo {
              width: 60px;
              height: auto;
              margin-bottom: 16px;
              opacity: 0.6;
            }
            .footer-text {
              color: #718096;
              font-size: 13px;
              line-height: 1.6;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-link {
              display: inline-block;
              margin: 0 12px;
              color: #a0aec0;
              text-decoration: none;
              font-size: 13px;
            }
            .social-link:hover {
              color: #805ad5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <img src="${logoUrl}" alt="Tuition LMS" class="logo" />
              </div>
              <h1 class="title">Class Reminder</h1>
              <p class="subtitle">Your class is starting soon</p>
            </div>
            <div class="content">
              <div class="alert-banner">
                ⏰ Your class starts in 30 minutes!
              </div>
              
              <div class="class-card">
                <div class="class-title">${className}</div>
                <div class="class-details">
                  <div class="detail-item">
                    <div class="detail-icon">👨‍🏫</div>
                    <div class="detail-content">
                      <div class="detail-label">Teacher</div>
                      <div class="detail-value">${teacherName}</div>
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-icon">🕐</div>
                    <div class="detail-content">
                      <div class="detail-label">Start Time</div>
                      <div class="detail-value">${startTime.toLocaleString()}</div>
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-icon">📅</div>
                    <div class="detail-content">
                      <div class="detail-label">Date</div>
                      <div class="detail-value">${startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="countdown-box">
                <div class="countdown-text">30 Minutes Until Class</div>
                <p style="margin: 10px 0 0 0; color: #744210; font-size: 14px;">
                  Get ready! Your class is about to begin.
                </p>
              </div>
              
              <div class="button-container">
                <a href="${dashboardUrl}" class="button">Go to Classroom →</a>
              </div>
              
              <div class="tips-section">
                <div class="tips-title">Quick Preparation Tips</div>
                <ul class="tips-list">
                  <li>Ensure you have a stable internet connection</li>
                  <li>Keep your study materials ready</li>
                  <li>Find a quiet place free from distractions</li>
                  <li>Test your audio and video if it's an online class</li>
                  <li>Have a notebook and pen ready for notes</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <img src="${logoUrl}" alt="Tuition LMS" class="footer-logo" />
              <div class="footer-text">
                <p style="margin: 5px 0; color: #4a5568;">© 2024 Balsampada. All rights reserved.</p>
                <p style="margin: 5px 0;">Never miss a class with our reminders</p>
              </div>
              <div class="social-links">
                <a href="#" class="social-link">Website</a>
                <a href="#" class="social-link">Support</a>
                <a href="#" class="social-link">Privacy</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: emails,
            subject: `Class Reminder: ${className} - ${this.appName}`,
            html,
        });
    }
    async sendWelcomeBackEmail(email, name, role) {
        const dashboardUrl = `${this.configService.get('FRONTEND_URL')}/${role.toLowerCase()}/dashboard`;
        const logoUrl = `${this.configService.get('FRONTEND_URL')}/logo.png`;
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #4a5568;
              background: #f7fafc;
            }
            .wrapper {
              background: #f7fafc;
              padding: 40px 20px;
              min-height: 100vh;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 
                0 4px 6px rgba(0, 0, 0, 0.05),
                0 10px 15px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: #ffffff;
              padding: 48px 32px 32px;
              text-align: center;
              border-bottom: 1px solid #e2e8f0;
            }
            .logo-container {
              display: inline-block;
              padding: 20px;
              background: #f7fafc;
              border-radius: 20px;
              margin-bottom: 24px;
              box-shadow: 
                inset 3px 3px 6px #d1d9e6,
                inset -3px -3px 6px #ffffff;
            }
            .logo {
              width: 120px;
              height: auto;
              display: block;
            }
            .welcome-text {
              color: #2d3748;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            .subtitle {
              color: #718096;
              font-size: 16px;
              font-weight: 400;
            }
            .content {
              padding: 40px 32px;
              background: #ffffff;
            }
            .greeting-box {
              background: #edf2f7;
              padding: 20px;
              border-radius: 16px;
              margin-bottom: 32px;
              box-shadow: 
                inset 2px 2px 4px rgba(0, 0, 0, 0.06),
                inset -2px -2px 4px rgba(255, 255, 255, 0.5);
            }
            .greeting-text {
              font-size: 16px;
              color: #4a5568;
              font-weight: 500;
            }
            .role-badge {
              display: inline-block;
              background: #805ad5;
              color: white;
              padding: 6px 16px;
              border-radius: 12px;
              font-size: 13px;
              font-weight: 600;
              margin-left: 10px;
              box-shadow: 0 2px 4px rgba(128, 90, 213, 0.3);
            }
            .button-container {
              text-align: center;
              margin: 36px 0;
            }
            .cta-button {
              display: inline-block;
              padding: 14px 32px;
              background: #805ad5;
              color: white;
              text-decoration: none;
              border-radius: 16px;
              font-weight: 600;
              font-size: 15px;
              box-shadow: 
                0 4px 14px rgba(128, 90, 213, 0.25),
                0 2px 4px rgba(128, 90, 213, 0.15);
              transition: all 0.3s ease;
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 
                0 6px 20px rgba(128, 90, 213, 0.3),
                0 4px 8px rgba(128, 90, 213, 0.2);
            }
            .features-section {
              margin: 36px 0;
            }
            .features-title {
              color: #2d3748;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
            }
            .feature-grid {
              display: grid;
              gap: 12px;
            }
            .feature-card {
              background: #f7fafc;
              padding: 16px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              transition: all 0.3s ease;
              box-shadow: 
                2px 2px 6px rgba(0, 0, 0, 0.04),
                -2px -2px 6px rgba(255, 255, 255, 0.9);
            }
            .feature-card:hover {
              background: #edf2f7;
              transform: translateX(4px);
            }
            .feature-icon {
              width: 40px;
              height: 40px;
              background: #ffffff;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 14px;
              font-size: 20px;
              box-shadow: 
                inset 2px 2px 4px rgba(0, 0, 0, 0.06),
                inset -2px -2px 4px rgba(255, 255, 255, 0.5);
            }
            .feature-text {
              color: #4a5568;
              font-size: 14px;
              line-height: 1.5;
            }
            .support-section {
              background: #f7fafc;
              padding: 24px;
              border-radius: 16px;
              margin-top: 36px;
              text-align: center;
              box-shadow: 
                inset 2px 2px 4px rgba(0, 0, 0, 0.06),
                inset -2px -2px 4px rgba(255, 255, 255, 0.5);
            }
            .support-title {
              color: #2d3748;
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .support-text {
              color: #718096;
              font-size: 14px;
              line-height: 1.6;
            }
            .footer {
              background: #f7fafc;
              color: #718096;
              text-align: center;
              padding: 32px;
              font-size: 13px;
              border-top: 1px solid #e2e8f0;
            }
            .footer-logo {
              opacity: 0.6;
              margin-bottom: 16px;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-link {
              display: inline-block;
              margin: 0 12px;
              color: #a0aec0;
              text-decoration: none;
              font-size: 13px;
            }
            .social-link:hover {
              color: #805ad5;
            }
            @media only screen and (max-width: 600px) {
              .welcome-text { font-size: 24px; }
              .content { padding: 32px 20px; }
              .cta-button { padding: 12px 28px; font-size: 14px; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <div class="logo-container">
                  <img src="${logoUrl}" alt="Tuition LMS" class="logo">
                </div>
                <h1 class="welcome-text">Welcome Back, ${name}!</h1>
                <p class="subtitle">Your learning journey continues</p>
              </div>
              
              <div class="content">
                <div class="greeting-box">
                  <p class="greeting-text">
                    Successfully logged in as
                    <span class="role-badge">${role}</span>
                  </p>
                </div>

                <div class="button-container">
                  <a href="${dashboardUrl}" class="cta-button">
                    Go to Dashboard →
                  </a>
                </div>

                <div class="features-section">
                  <h2 class="features-title">What's waiting for you</h2>
                  <div class="feature-grid">
                    ${role === 'STUDENT' ? `
                      <div class="feature-card">
                        <div class="feature-icon">📚</div>
                        <span class="feature-text">Access your enrolled courses and study materials</span>
                      </div>
                      <div class="feature-card">
                        <div class="feature-icon">📝</div>
                        <span class="feature-text">Submit assignments and track your progress</span>
                      </div>
                      <div class="feature-card">
                        <div class="feature-icon">💬</div>
                        <span class="feature-text">Connect with your teachers through messaging</span>
                      </div>
                      <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <span class="feature-text">View your grades and attendance records</span>
                      </div>
                    ` : role === 'TEACHER' ? `
                      <div class="feature-card">
                        <div class="feature-icon">👥</div>
                        <span class="feature-text">Manage your students and classes efficiently</span>
                      </div>
                      <div class="feature-card">
                        <div class="feature-icon">📚</div>
                        <span class="feature-text">Upload study materials and create assignments</span>
                      </div>
                      <div class="feature-card">
                        <div class="feature-icon">✅</div>
                        <span class="feature-text">Grade submissions and track student progress</span>
                      </div>
                      <div class="feature-card">
                        <div class="feature-icon">💬</div>
                        <span class="feature-text">Communicate with students through messaging</span>
                      </div>
                    ` : `
                      <div class="feature-card">
                        <div class="feature-icon">👥</div>
                        <span class="feature-text">Manage teachers and students effectively</span>
                      </div>
                      <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <span class="feature-text">View comprehensive analytics and reports</span>
                      </div>
                      <div class="feature-card">
                        <div class="feature-icon">✅</div>
                        <span class="feature-text">Approve registrations and payments</span>
                      </div>
                      <div class="feature-card">
                        <div class="feature-icon">⚙️</div>
                        <span class="feature-text">Configure system settings and preferences</span>
                      </div>
                    `}
                  </div>
                </div>

                <div class="support-section">
                  <h3 class="support-title">Need Help?</h3>
                  <p class="support-text">
                    Our support team is here to assist you.<br>
                    Reply to this email or visit our help center for immediate assistance.
                  </p>
                </div>
              </div>

              <div class="footer">
                <img src="${logoUrl}" alt="Tuition LMS" style="width: 60px; height: auto; opacity: 0.6; margin-bottom: 16px;">
                <p style="margin-bottom: 8px; color: #4a5568;">© 2024 Balsampada Education. All rights reserved.</p>
                <div class="social-links">
                  <a href="#" class="social-link">Website</a>
                  <a href="#" class="social-link">Support</a>
                  <a href="#" class="social-link">Privacy</a>
                </div>
                <p style="color: #a0aec0; font-size: 12px; margin-top: 16px;">
                  This is an automated message sent after successful login.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
        return this.sendEmail({
            to: email,
            subject: `Welcome Back to Balsampada`,
            html,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map