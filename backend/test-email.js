const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 587,
  secure: false,
  auth: {
    user: 'harshal.baviskar@balsampada.com',
    pass: 'z2c1S5K5urRG'
  }
});

async function testEmail() {
  try {
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: '"Balsampada Tuition" <harshal.baviskar@balsampada.com>',
      to: 'harshal.baviskar@balsampada.com',
      subject: 'Test Email - Zoho Mail Working!',
      text: 'This is a test email from your Tuition LMS.',
      html: '<h1>✅ Email Working!</h1><p>Your Zoho Mail integration is working perfectly!</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Possible fixes:');
      console.log('1. Make sure the app-specific password is correct');
      console.log('2. Check if SMTP is enabled in Zoho Mail settings');
      console.log('3. Try using port 465 with secure: true');
    }
  }
}

testEmail();