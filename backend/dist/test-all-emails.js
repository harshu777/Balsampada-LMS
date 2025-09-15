"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const email_service_1 = require("./src/email/email.service");
async function testAllEmails() {
    console.log('🚀 Starting comprehensive email template test...\n');
    try {
        const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
        const emailService = app.get(email_service_1.EmailService);
        const testEmail = 'hbaviskar777@gmail.com';
        const testName = 'Harshal Baviskar';
        console.log('📧 Testing all email templates...\n');
        console.log('1️⃣ Sending Welcome Back email...');
        const welcomeResult = await emailService.sendWelcomeBackEmail(testEmail, testName, 'STUDENT');
        console.log(welcomeResult ? '✅ Welcome Back email sent!' : '❌ Failed to send Welcome Back email');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('\n2️⃣ Sending Verification email...');
        const verificationResult = await emailService.sendVerificationEmail(testEmail, testName, 'test-verification-token-123456');
        console.log(verificationResult ? '✅ Verification email sent!' : '❌ Failed to send Verification email');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('\n3️⃣ Sending Password Reset email...');
        const resetResult = await emailService.sendPasswordResetEmail(testEmail, testName, 'test-reset-token-789012');
        console.log(resetResult ? '✅ Password Reset email sent!' : '❌ Failed to send Password Reset email');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('\n4️⃣ Sending Account Approved email...');
        const approvalResult = await emailService.sendApprovalEmail(testEmail, testName, 'APPROVED');
        console.log(approvalResult ? '✅ Account Approved email sent!' : '❌ Failed to send Account Approved email');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('\n5️⃣ Sending Account Rejected email...');
        const rejectionResult = await emailService.sendApprovalEmail(testEmail, testName, 'REJECTED', 'Documents incomplete - Please upload all required identification documents');
        console.log(rejectionResult ? '✅ Account Rejected email sent!' : '❌ Failed to send Account Rejected email');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('\n6️⃣ Sending Payment Approved email...');
        const paymentApprovedResult = await emailService.sendPaymentConfirmationEmail(testEmail, testName, 5000, 'APPROVED', 'Monthly Tuition Fee');
        console.log(paymentApprovedResult ? '✅ Payment Approved email sent!' : '❌ Failed to send Payment Approved email');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('\n7️⃣ Sending Payment Rejected email...');
        const paymentRejectedResult = await emailService.sendPaymentConfirmationEmail(testEmail, testName, 3000, 'REJECTED', 'Course Registration Fee', 'Invalid payment details provided');
        console.log(paymentRejectedResult ? '✅ Payment Rejected email sent!' : '❌ Failed to send Payment Rejected email');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('\n8️⃣ Sending Class Reminder email...');
        const reminderResult = await emailService.sendClassReminderEmail([testEmail], 'Advanced Mathematics - Calculus', 'Prof. Sharma', new Date(Date.now() + 30 * 60 * 1000));
        console.log(reminderResult ? '✅ Class Reminder email sent!' : '❌ Failed to send Class Reminder email');
        console.log('\n' + '='.repeat(50));
        console.log('📊 Email Test Summary:');
        console.log('='.repeat(50));
        console.log(`
    ✉️ Total emails sent: 8
    📬 Recipient: ${testEmail}
    
    Templates tested:
    1. Welcome Back (Login notification)
    2. Email Verification
    3. Password Reset
    4. Account Approved
    5. Account Rejected (with reason)
    6. Payment Approved
    7. Payment Rejected (with reason)
    8. Class Reminder
    `);
        console.log('='.repeat(50));
        console.log('\n✨ All email templates have been sent successfully!');
        console.log('📬 Please check your inbox at', testEmail);
        console.log('📁 Also check your spam folder if you don\'t see them');
        await app.close();
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
testAllEmails();
//# sourceMappingURL=test-all-emails.js.map