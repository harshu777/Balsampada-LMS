"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const email_service_1 = require("./src/email/email.service");
async function testEmail() {
    console.log('🚀 Starting email test...');
    try {
        const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
        const emailService = app.get(email_service_1.EmailService);
        console.log('📧 Sending welcome email to hbaviskar777@gmail.com...');
        const result = await emailService.sendWelcomeBackEmail('hbaviskar777@gmail.com', 'Harshal-new Baviskar', 'STUDENT');
        if (result) {
            console.log('✅ Email sent successfully!');
            console.log('📬 Please check your inbox at hbaviskar777@gmail.com');
        }
        else {
            console.log('❌ Failed to send email. Please check your email configuration.');
        }
        await app.close();
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
testEmail();
//# sourceMappingURL=test-email.js.map