"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@tuitionlms.com' },
        update: {},
        create: {
            email: 'admin@tuitionlms.com',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: client_1.Role.ADMIN,
            status: client_1.UserStatus.APPROVED,
            phone: '+1234567890',
            address: '123 Admin Street',
        },
    });
    console.log('Created admin user:', admin.email);
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@tuitionlms.com' },
        update: {},
        create: {
            email: 'teacher@tuitionlms.com',
            password: teacherPassword,
            firstName: 'John',
            lastName: 'Anderson',
            role: client_1.Role.TEACHER,
            status: client_1.UserStatus.APPROVED,
            phone: '+1234567891',
            address: '456 Teacher Avenue',
        },
    });
    console.log('Created teacher user:', teacher.email);
    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await prisma.user.upsert({
        where: { email: 'student@tuitionlms.com' },
        update: {},
        create: {
            email: 'student@tuitionlms.com',
            password: studentPassword,
            firstName: 'Sarah',
            lastName: 'Johnson',
            role: client_1.Role.STUDENT,
            status: client_1.UserStatus.APPROVED,
            phone: '+1234567892',
            address: '789 Student Road',
        },
    });
    console.log('Created student user:', student.email);
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
            paymentStatus: client_1.PaymentStatus.APPROVED,
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
//# sourceMappingURL=seed.js.map