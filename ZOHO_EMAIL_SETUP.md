# 📧 Zoho Mail Setup Guide - Professional Email (FREE)

## ✅ Why Zoho Mail?
- **Professional email** with custom domain (@balsampada.com)
- **FREE** for up to 5 users
- **250 emails/day** limit per user
- **No ads** - Clean, professional interface
- **Better deliverability** than Gmail for business emails

## 🚀 Quick Setup Steps

### Step 1: Enable SMTP in Zoho Mail
1. Login to Zoho Mail: https://mail.zoho.in/
2. Go to **Settings** (gear icon) → **Mail Accounts**
3. Click on **SMTP** section
4. Enable **SMTP Access**
5. Note down the settings:
   - Server: `smtp.zoho.in` (for India) or `smtp.zoho.com` (for US/EU)
   - Port: `587` (TLS) or `465` (SSL)

### Step 2: Get Your Password
**Option A: Regular Password (if 2FA is disabled)**
- Use your regular Zoho login password

**Option B: App-Specific Password (if 2FA is enabled)**
1. Go to: https://accounts.zoho.in/home#security/
2. Click on **Application-Specific Passwords**
3. Click **Generate New Password**
4. Enter name: "Tuition LMS"
5. Copy the generated password

### Step 3: Update Your .env File
```bash
# Zoho Mail Configuration
MAIL_HOST=smtp.zoho.in        # Use smtp.zoho.com for US/EU accounts
MAIL_PORT=587                  # or 465 for SSL
MAIL_USER=harshal.baviskar@balsampada.com
MAIL_PASSWORD=your-zoho-password-here    # Your password from Step 2
MAIL_FROM=harshal.baviskar@balsampada.com
FRONTEND_URL=http://localhost:3000
```

### Step 4: Update Email Service (if needed)
The email service supports both TLS and SSL. If you face issues with port 587, try:

```javascript
// In email.service.ts, update transporter config:
this.transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,           // SSL port
  secure: true,        // true for SSL
  auth: {
    user: 'harshal.baviskar@balsampada.com',
    pass: 'your-password'
  }
});
```

## 📨 Zoho Mail Limits

### Free Plan Limits:
- **5 users** maximum
- **5 GB** storage per user
- **250 emails/day** per user
- **50 recipients** per email
- **25 MB** attachment size

### Sending Limits Reset:
- Daily limit resets at **12:00 AM IST**
- If you hit the limit, wait until midnight

## 🔧 Testing Your Setup

### Test Command:
```bash
# Create a test endpoint in your backend
curl -X POST http://localhost:3001/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email from Tuition LMS",
    "message": "If you receive this, Zoho Mail is working!"
  }'
```

## ⚠️ Common Issues & Solutions

### Issue 1: "Authentication Failed"
**Solutions:**
- Double-check email and password
- If using 2FA, use app-specific password
- Ensure SMTP is enabled in Zoho settings

### Issue 2: "Connection Timeout"
**Solutions:**
- Try alternate port (587 → 465)
- Check firewall settings
- Try alternate host (smtp.zoho.in → smtp.zoho.com)

### Issue 3: "Invalid From Address"
**Solutions:**
- MAIL_FROM must be same as MAIL_USER for Zoho
- Cannot use aliases in free plan

### Issue 4: "Daily Limit Exceeded"
**Solutions:**
- Wait until midnight IST for reset
- Upgrade to paid plan for more emails
- Use batch sending for bulk emails

## 🎯 Professional Email Benefits

With `harshal.baviskar@balsampada.com`:
- ✅ Looks professional to parents/students
- ✅ Better email deliverability
- ✅ Custom domain branding
- ✅ No "via gmail.com" in headers
- ✅ SPF/DKIM authentication possible

## 📝 Email Templates Update

Update the sender name in email.service.ts:

```typescript
// In email.service.ts
this.fromEmail = 'harshal.baviskar@balsampada.com';
this.appName = 'Balsampada Tuition LMS';

// In email templates
const mailOptions = {
  from: '"Balsampada Education" <harshal.baviskar@balsampada.com>',
  // ... rest of config
};
```

## 🚀 Next Steps

1. ✅ Add your Zoho password to `.env`
2. ✅ Restart backend server
3. ✅ Test email sending
4. ⏳ Configure SPF/DKIM for better deliverability (optional)

## 🔒 Security Best Practices

1. **Never commit** your password to Git
2. Use **app-specific password** if 2FA is enabled
3. **Rotate passwords** periodically
4. Set up **SPF records** for your domain
5. Monitor **email bounce rates**

## 📊 Zoho vs Other Options

| Feature | Zoho Mail | Gmail | SendGrid |
|---------|-----------|-------|----------|
| Custom Domain | ✅ Free | ❌ Paid | ✅ |
| Daily Limit | 250 | 500 | 100 |
| Professional Look | ✅ | ⚠️ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Cost | Free (5 users) | Free | Free (100/day) |

## 🆘 Additional Resources

- Zoho Mail Help: https://www.zoho.com/mail/help/
- SMTP Settings: https://www.zoho.com/mail/help/smtp-configuration.html
- API Documentation: https://www.zoho.com/mail/help/api/

---

**Note:** Zoho Mail is perfect for your Tuition LMS as it provides professional email addresses with your custom domain, making your communications look more credible to parents and students.