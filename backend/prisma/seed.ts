import { PrismaClient, Role, UserStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tuitionlms.com' },
    update: {},
    create: {
      email: 'admin@tuitionlms.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      status: UserStatus.APPROVED,
      phone: '+1234567890',
      address: '123 Admin Street',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create Teacher user
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@tuitionlms.com' },
    update: {},
    create: {
      email: 'teacher@tuitionlms.com',
      password: teacherPassword,
      firstName: 'John',
      lastName: 'Anderson',
      role: Role.TEACHER,
      status: UserStatus.APPROVED,
      phone: '+1234567891',
      address: '456 Teacher Avenue',
    },
  });

  console.log('Created teacher user:', teacher.email);

  // Create Student user
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@tuitionlms.com' },
    update: {},
    create: {
      email: 'student@tuitionlms.com',
      password: studentPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: Role.STUDENT,
      status: UserStatus.APPROVED,
      phone: '+1234567892',
      address: '789 Student Road',
    },
  });

  console.log('Created student user:', student.email);

  // Create some classes
  const class10 = await prisma.class.create({
    data: {
      name: 'Grade 10',
      description: 'Standard 10th grade curriculum',
      grade: '10',
    },
  });

  const class11 = await prisma.class.create({
    data: {
      name: 'Grade 11',
      description: 'Standard 11th grade curriculum',
      grade: '11',
    },
  });

  console.log('Created classes:', class10.name, class11.name);

  // Create some subjects
  const mathematics = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      description: 'Advanced Mathematics for Grade 10',
      classId: class10.id,
    },
  });

  const physics = await prisma.subject.create({
    data: {
      name: 'Physics',
      description: 'Physics fundamentals for Grade 11',
      classId: class11.id,
    },
  });

  console.log('Created subjects:', mathematics.name, physics.name);

  // Assign teacher to subjects
  await prisma.teacherSubject.upsert({
    where: {
      teacherId_subjectId: {
        teacherId: teacher.id,
        subjectId: mathematics.id,
      }
    },
    update: {},
    create: {
      teacherId: teacher.id,
      subjectId: mathematics.id,
    },
  });

  await prisma.teacherSubject.upsert({
    where: {
      teacherId_subjectId: {
        teacherId: teacher.id,
        subjectId: physics.id,
      }
    },
    update: {},
    create: {
      teacherId: teacher.id,
      subjectId: physics.id,
    },
  });

  console.log('Assigned teacher to subjects');

  // Enroll student in mathematics
  await prisma.studentEnrollment.upsert({
    where: {
      studentId_subjectId: {
        studentId: student.id,
        subjectId: mathematics.id,
      }
    },
    update: {},
    create: {
      studentId: student.id,
      subjectId: mathematics.id,
      paymentStatus: PaymentStatus.APPROVED,
      isActive: true,
    },
  });

  console.log('Enrolled student in Mathematics');

  console.log('\n=== Seed Complete ===');
  console.log('\nLogin Credentials:');
  console.log('Admin: admin@tuitionlms.com / admin123');
  console.log('Teacher: teacher@tuitionlms.com / teacher123');
  console.log('Student: student@tuitionlms.com / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });