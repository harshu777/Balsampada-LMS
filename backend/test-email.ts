import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { EmailService } from './src/email/email.service';

async function testEmail() {
  console.log('🚀 Starting email test...');
  
  try {
    // Create a standalone application context
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Get the EmailService instance
    const emailService = app.get(EmailService);
    
    console.log('📧 Sending welcome email to hbaviskar777@gmail.com...');
    
    // Send the welcome email
    const result = await emailService.sendWelcomeBackEmail(
      'hbaviskar777@gmail.com',
      'Harshal-new Baviskar',
      'STUDENT'
    );
    
    if (result) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Please check your inbox at hbaviskar777@gmail.com');
    } else {
      console.log('❌ Failed to send email. Please check your email configuration.');
    }
    
    // Close the application
    await app.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the test
testEmail();