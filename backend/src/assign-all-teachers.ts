import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignAllTeachers() {
  console.log('🔧 Assigning subjects to all teachers...');

  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER', status: 'APPROVED' },
      select: { id: true, firstName: true, lastName: true, email: true }
    });

    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      include: { class: true }
    });

    console.log(`Found ${teachers.length} teachers and ${subjects.length} subjects`);

    // Remove duplicate subjects (keep unique by name + class)
    const uniqueSubjects = subjects.filter((subject, index, self) => 
      index === self.findIndex(s => s.name === subject.name && s.classId === subject.classId)
    );

    console.log(`Using ${uniqueSubjects.length} unique subjects`);

    for (const teacher of teachers) {
      console.log(`\nAssigning subjects to ${teacher.firstName} ${teacher.lastName}:`);
      
      for (const subject of uniqueSubjects) {
        // Check if assignment already exists
        const existing = await prisma.teacherSubject.findFirst({
          where: {
            teacherId: teacher.id,
            subjectId: subject.id
          }
        });

        if (!existing) {
          await prisma.teacherSubject.create({
            data: {
              teacherId: teacher.id,
              subjectId: subject.id,
              isActive: true,
            }
          });
          
          console.log(`  ✅ Assigned to ${subject.name} (${subject.class.name})`);
        } else {
          console.log(`  ⏭️  Already assigned to ${subject.name} (${subject.class.name})`);
        }
      }
    }

    console.log('\n✅ All teachers now have subject assignments!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignAllTeachers();