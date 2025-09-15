const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Create test users with known passwords
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create Admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        email: 'admin@test.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'APPROVED',
        phone: '1234567890',
        address: 'Admin Address'
      }
    });
    console.log('✅ Admin created:', admin.email);

    // Create Teacher
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@test.com' },
      update: {},
      create: {
        email: 'teacher@test.com',
        password: hashedPassword,
        firstName: 'Teacher',
        lastName: 'User',
        role: 'TEACHER',
        status: 'APPROVED',
        phone: '1234567891',
        address: 'Teacher Address'
      }
    });
    console.log('✅ Teacher created:', teacher.email);

    // Create Student
    const student = await prisma.user.upsert({
      where: { email: 'student@test.com' },
      update: {},
      create: {
        email: 'student@test.com',
        password: hashedPassword,
        firstName: 'Student',
        lastName: 'User',
        role: 'STUDENT',
        status: 'APPROVED',
        phone: '1234567892',
        address: 'Student Address'
      }
    });
    console.log('✅ Student created:', student.email);

    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@test.com / password123');
    console.log('Teacher: teacher@test.com / password123');
    console.log('Student: student@test.com / password123');

  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();