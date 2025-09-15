import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTeacherSubjects() {
  console.log('🌱 Checking and seeding teacher-subject assignments...');

  try {
    // First, let's see what we have
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER', status: 'APPROVED' },
      select: { id: true, firstName: true, lastName: true, email: true }
    });

    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      include: { class: true }
    });

    console.log(`Found ${teachers.length} approved teachers:`);
    teachers.forEach(t => console.log(`- ${t.firstName} ${t.lastName} (${t.email})`));

    console.log(`Found ${subjects.length} active subjects:`);
    subjects.forEach(s => console.log(`- ${s.name} (${s.class.name})`));

    // Check existing teacher-subject assignments
    const teacherSubjects = await prisma.teacherSubject.findMany({
      include: {
        teacher: { select: { firstName: true, lastName: true } },
        subject: { include: { class: true } }
      }
    });

    console.log(`Found ${teacherSubjects.length} teacher-subject assignments:`);
    teacherSubjects.forEach(ts => 
      console.log(`- ${ts.teacher.firstName} ${ts.teacher.lastName} -> ${ts.subject.name} (${ts.subject.class.name})`)
    );

    // If no assignments exist and we have both teachers and subjects, create some
    if (teacherSubjects.length === 0 && teachers.length > 0 && subjects.length > 0) {
      console.log('\n🔧 Creating teacher-subject assignments...');
      
      // Assign first teacher to all subjects (for testing)
      const teacher = teachers[0];
      
      for (const subject of subjects) {
        await prisma.teacherSubject.create({
          data: {
            teacherId: teacher.id,
            subjectId: subject.id,
            isActive: true,
          }
        });
        
        console.log(`✅ Assigned ${teacher.firstName} ${teacher.lastName} to ${subject.name} (${subject.class.name})`);
      }
    } else if (teacherSubjects.length === 0) {
      console.log('⚠️  No teachers or subjects found to create assignments');
    }

    console.log('\n✅ Teacher-subject seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding teacher-subjects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTeacherSubjects();