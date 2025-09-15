import { Controller, Post, Body, UseGuards, Get, Req, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { EmailService } from '../email/email.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailService: EmailService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: any) {
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();
    return this.authService.refreshTokens(req.user.id, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      user.id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  // TEST EMAIL ENDPOINT - Remove in production
  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  async testEmail(@Body() body: { to?: string; type?: string }) {
    const testEmail = body.to || 'harshal.baviskar@balsampada.com';
    const emailType = body.type || 'simple';
    
    try {
      let result;
      
      if (emailType === 'simple') {
        // Simple test email
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
      } else if (emailType === 'verification') {
        result = await this.emailService.sendVerificationEmail(
          testEmail,
          'Test User',
          'test-token-123456'
        );
      } else if (emailType === 'password') {
        result = await this.emailService.sendPasswordResetEmail(
          testEmail,
          'Test User',
          'reset-token-123456'
        );
      } else if (emailType === 'payment') {
        result = await this.emailService.sendPaymentConfirmationEmail(
          testEmail,
          'Test User',
          5000,
          'APPROVED',
          'Monthly Fee'
        );
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
      } else {
        return {
          success: false,
          message: '❌ Email sending failed',
          hint: 'Check server logs for details'
        };
      }
    } catch (error: any) {
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
}