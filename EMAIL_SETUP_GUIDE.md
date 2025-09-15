# 📧 Email Setup Guide - Gmail SMTP (FREE)

## ✅ Why Gmail SMTP?
- **Completely FREE** - No credit card required
- **500 emails per day** limit - Perfect for small/medium operations
- **Reliable** - Google's infrastructure
- **Easy setup** - 5 minutes configuration

## 🚀 Quick Setup Steps

### Step 1: Enable 2-Factor Authentication on Gmail
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "How you sign in to Google", click on "2-Step Verification"
4. Follow the prompts to enable 2FA

### Step 2: Generate App-Specific Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: Choose "Mail"
3. Select device: Choose "Other" and enter "Tuition LMS"
4. Click "Generate"
5. **Copy the 16-character password** (spaces don't matter)

### Step 3: Update Your .env File
```bash
# Email Configuration (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-gmail-account@gmail.com  # Your Gmail address
MAIL_PASSWORD=xxxx xxxx xxxx xxxx       # The 16-char app password from Step 2
MAIL_FROM=your-gmail-account@gmail.com  # Usually same as MAIL_USER
FRONTEND_URL=http://localhost:3000
```

### Step 4: Test Email Service
```bash
# Restart your backend server
npm run start:dev

# The console should show:
# "Email service is ready to send emails"
```

## 📨 Email Features Implemented

### 1. **Email Verification**
- Sent when user registers
- Contains verification link
- Link expires in 24 hours

### 2. **Password Reset**
- Sent when user requests password reset
- Contains reset link
- Link expires in 1 hour

### 3. **Account Approval/Rejection**
- Sent when admin approves/rejects account
- Contains login link if approved
- Contains rejection reason if rejected

### 4. **Payment Confirmation**
- Sent when payment is approved/rejected
- Contains payment details
- Contains receipt information

### 5. **Class Reminders**
- Sent 30 minutes before class starts
- Contains class details
- Sent to all enrolled students

## 🔧 Integration in Auth Service

Update your `auth.service.ts` to use email service:

```typescript
// In auth.service.ts
import { EmailService } from '../email/email.service';

constructor(
  // ... other dependencies
  private emailService: EmailService,
) {}

async register(registerDto: RegisterDto) {
  // ... create user logic
  
  // Generate verification token
  const verificationToken = this.generateToken();
  
  // Save token to user
  await this.prisma.user.update({
    where: { id: user.id },
    data: { emailVerificationToken: verificationToken }
  });
  
  // Send verification email
  await this.emailService.sendVerificationEmail(
    user.email,
    `${user.firstName} ${user.lastName}`,
    verificationToken
  );
  
  return user;
}
```

## 🎯 Testing Email Locally

### Test Registration Email:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "STUDENT"
  }'
```

### Test Password Reset:
```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com"}'
```

## ⚠️ Important Notes

### Gmail Limits:
- **500 emails/day** for regular Gmail
- **2000 emails/day** for Google Workspace accounts
- Resets every 24 hours

### Security Best Practices:
1. **Never commit** your app password to Git
2. Use environment variables
3. Keep 2FA enabled always
4. Rotate app passwords periodically

### Troubleshooting:

**Error: "Invalid login"**
- Check if 2FA is enabled
- Ensure you're using app password, not regular password
- Check for typos in email/password

**Error: "Connection timeout"**
- Check firewall settings
- Ensure port 587 is not blocked
- Try port 465 with secure: true

**Error: "Quota exceeded"**
- You've hit the 500 email/day limit
- Wait 24 hours or use different account

## 🚀 Alternative Free Options

If Gmail doesn't work for you:

### 1. **Resend** (3000 emails/month free)
```bash
npm install resend
# Super simple API-based service
```

### 2. **SendGrid** (100 emails/day free)
```bash
npm install @sendgrid/mail
# Industry standard, great deliverability
```

### 3. **Brevo** (300 emails/day free)
```bash
# Previously Sendinblue
# Good for transactional emails
```

## 📝 Next Steps

1. ✅ Configure Gmail with app password
2. ✅ Test email sending
3. ⏳ Implement email verification endpoint
4. ⏳ Implement password reset flow
5. ⏳ Add email templates for other notifications

## 🆘 Need Help?

If you encounter issues:
1. Double-check your Gmail 2FA is enabled
2. Regenerate app password if needed
3. Check spam folder for test emails
4. Ensure `.env` file is loaded correctly

---

**Remember:** This email service is production-ready for small to medium scale operations. For larger scale (>500 emails/day), consider upgrading to a paid service like SendGrid, AWS SES, or Mailgun.