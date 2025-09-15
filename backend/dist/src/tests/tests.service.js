"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const create_test_dto_1 = require("./dto/create-test.dto");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
let TestsService = class TestsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(createTestDto, teacherId) {
        const teacherSubject = await this.prisma.teacherSubject.findFirst({
            where: {
                teacherId,
                subjectId: createTestDto.subjectId,
                isActive: true,
            },
            include: {
                subject: {
                    include: {
                        class: true,
                    },
                },
            },
        });
        if (!teacherSubject) {
            throw new common_1.ForbiddenException('You do not have permission to create tests for this subject');
        }
        const startTime = new Date(createTestDto.startTime);
        const endTime = new Date(createTestDto.endTime);
        if (startTime >= endTime) {
            throw new common_1.BadRequestException('Start time must be before end time');
        }
        if (startTime <= new Date()) {
            throw new common_1.BadRequestException('Start time must be in the future');
        }
        const questionsWithIds = createTestDto.questions.map(question => ({
            ...question,
            id: (0, uuid_1.v4)(),
        }));
        const test = await this.prisma.test.create({
            data: {
                title: createTestDto.title,
                description: createTestDto.description,
                subjectId: createTestDto.subjectId,
                teacherId,
                questions: questionsWithIds,
                totalMarks: createTestDto.totalMarks,
                duration: createTestDto.duration,
                startTime,
                endTime,
                isActive: createTestDto.isActive,
            },
            include: {
                subject: {
                    include: {
                        class: true,
                        enrollments: {
                            where: { isActive: true },
                            include: {
                                student: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        const studentIds = test.subject.enrollments.map(e => e.studentId);
        if (studentIds.length > 0) {
            const teacherName = `${test.teacher.firstName} ${test.teacher.lastName}`;
            await this.notificationsService.createTestNotification(studentIds, test.id, test.title, test.subject.name, test.startTime, test.duration);
        }
        return test;
    }
    async findAll(page = 1, limit = 10, search, subjectId, teacherId, isActive) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (subjectId)
            where.subjectId = subjectId;
        if (teacherId)
            where.teacherId = teacherId;
        if (isActive !== undefined)
            where.isActive = isActive;
        const [tests, total] = await Promise.all([
            this.prisma.test.findMany({
                where,
                skip,
                take: limit,
                include: {
                    subject: {
                        include: {
                            class: true,
                        },
                    },
                    teacher: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    attempts: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            attempts: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.test.count({ where }),
        ]);
        return {
            tests,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, userId, userRole, includeAnswers = false) {
        const test = await this.prisma.test.findUnique({
            where: { id },
            include: {
                subject: {
                    include: {
                        class: true,
                        enrollments: {
                            where: { isActive: true },
                            include: {
                                student: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                attempts: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                    orderBy: { startedAt: 'desc' },
                },
            },
        });
        if (!test) {
            throw new common_1.NotFoundException('Test not found');
        }
        if (userRole === client_1.Role.STUDENT) {
            const isEnrolled = test.subject.enrollments.some(e => e.studentId === userId);
            if (!isEnrolled) {
                throw new common_1.ForbiddenException('You are not enrolled in this subject');
            }
            if (!includeAnswers) {
                test.questions = this.hideAnswersFromQuestions(test.questions);
            }
        }
        else if (userRole === client_1.Role.TEACHER && test.teacherId !== userId) {
            throw new common_1.ForbiddenException('You can only view your own tests');
        }
        return test;
    }
    async findStudentTests(studentId, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const currentTime = new Date();
        const where = {
            subject: {
                enrollments: {
                    some: {
                        studentId,
                        isActive: true,
                    },
                },
            },
            isActive: true,
        };
        if (status === 'upcoming') {
            where.startTime = { gt: currentTime };
        }
        else if (status === 'ongoing') {
            where.AND = [
                { startTime: { lte: currentTime } },
                { endTime: { gte: currentTime } },
            ];
        }
        else if (status === 'completed') {
            where.endTime = { lt: currentTime };
        }
        const [tests, total] = await Promise.all([
            this.prisma.test.findMany({
                where,
                skip,
                take: limit,
                include: {
                    subject: {
                        include: {
                            class: true,
                        },
                    },
                    teacher: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    attempts: {
                        where: { studentId },
                        orderBy: { startedAt: 'desc' },
                        take: 1,
                    },
                },
                orderBy: { startTime: 'asc' },
            }),
            this.prisma.test.count({ where }),
        ]);
        const testsWithHiddenAnswers = tests.map(test => ({
            ...test,
            questions: this.hideAnswersFromQuestions(test.questions),
        }));
        return {
            tests: testsWithHiddenAnswers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async update(id, updateTestDto, teacherId, userRole) {
        const test = await this.prisma.test.findUnique({
            where: { id },
            include: {
                attempts: true,
            },
        });
        if (!test) {
            throw new common_1.NotFoundException('Test not found');
        }
        if (userRole === client_1.Role.TEACHER && test.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You can only update your own tests');
        }
        if (new Date() >= test.startTime) {
            throw new common_1.BadRequestException('Cannot update test that has already started');
        }
        if (test.attempts.length > 0) {
            throw new common_1.BadRequestException('Cannot update test that has student attempts');
        }
        const updateData = { ...updateTestDto };
        if (updateTestDto.startTime) {
            updateData.startTime = new Date(updateTestDto.startTime);
        }
        if (updateTestDto.endTime) {
            updateData.endTime = new Date(updateTestDto.endTime);
        }
        if (updateTestDto.questions) {
            updateData.questions = updateTestDto.questions.map(question => ({
                ...question,
                id: (0, uuid_1.v4)(),
            }));
        }
        const updatedTest = await this.prisma.test.update({
            where: { id },
            data: updateData,
            include: {
                subject: {
                    include: {
                        class: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                attempts: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        return updatedTest;
    }
    async remove(id, teacherId, userRole) {
        const test = await this.prisma.test.findUnique({
            where: { id },
            include: {
                attempts: true,
            },
        });
        if (!test) {
            throw new common_1.NotFoundException('Test not found');
        }
        if (userRole === client_1.Role.TEACHER && test.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You can only delete your own tests');
        }
        if (test.attempts.length > 0) {
            await this.prisma.test.update({
                where: { id },
                data: { isActive: false },
            });
            return { message: 'Test deactivated successfully (attempts exist)' };
        }
        else {
            await this.prisma.test.delete({
                where: { id },
            });
            return { message: 'Test deleted successfully' };
        }
    }
    async startTest(startDto, studentId) {
        const test = await this.prisma.test.findUnique({
            where: { id: startDto.testId },
            include: {
                subject: {
                    include: {
                        enrollments: {
                            where: { studentId, isActive: true },
                        },
                    },
                },
                attempts: {
                    where: { studentId },
                },
            },
        });
        if (!test || !test.isActive) {
            throw new common_1.NotFoundException('Test not found or inactive');
        }
        if (test.subject.enrollments.length === 0) {
            throw new common_1.ForbiddenException('You are not enrolled in this subject');
        }
        const currentTime = new Date();
        if (currentTime < test.startTime) {
            throw new common_1.BadRequestException('Test has not started yet');
        }
        if (currentTime > test.endTime) {
            throw new common_1.BadRequestException('Test has ended');
        }
        const existingAttempts = test.attempts.filter(attempt => !attempt.submittedAt);
        if (existingAttempts.length > 0) {
            return existingAttempts[0];
        }
        if (test.attempts.some(attempt => attempt.submittedAt)) {
            throw new common_1.BadRequestException('You have already completed this test');
        }
        const testAttempt = await this.prisma.studentTest.create({
            data: {
                testId: test.id,
                studentId,
                answers: {},
                startedAt: currentTime,
            },
            include: {
                test: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        questions: true,
                        totalMarks: true,
                        duration: true,
                        startTime: true,
                        endTime: true,
                    },
                },
            },
        });
        const testWithHiddenAnswers = {
            ...testAttempt,
            test: {
                ...testAttempt.test,
                questions: this.hideAnswersFromQuestions(testAttempt.test.questions),
            },
        };
        return testWithHiddenAnswers;
    }
    async submitTest(submitDto, studentId) {
        const testAttempt = await this.prisma.studentTest.findUnique({
            where: {
                testId_studentId: {
                    testId: submitDto.testId,
                    studentId,
                },
            },
            include: {
                test: {
                    include: {
                        subject: true,
                        teacher: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!testAttempt) {
            throw new common_1.NotFoundException('Test attempt not found');
        }
        if (testAttempt.submittedAt) {
            throw new common_1.BadRequestException('Test already submitted');
        }
        const currentTime = new Date();
        const timeLimit = new Date(testAttempt.startedAt.getTime() + testAttempt.test.duration * 60000);
        if (currentTime > timeLimit || currentTime > testAttempt.test.endTime) {
            const autoSubmission = await this.prisma.studentTest.update({
                where: {
                    testId_studentId: {
                        testId: submitDto.testId,
                        studentId,
                    },
                },
                data: {
                    answers: submitDto.answers,
                    submittedAt: currentTime,
                    marksObtained: 0,
                },
            });
            throw new common_1.BadRequestException('Time limit exceeded. Test auto-submitted.');
        }
        const marksObtained = this.calculateMarks(testAttempt.test.questions, submitDto.answers);
        const submittedTest = await this.prisma.studentTest.update({
            where: {
                testId_studentId: {
                    testId: submitDto.testId,
                    studentId,
                },
            },
            data: {
                answers: submitDto.answers,
                submittedAt: currentTime,
                marksObtained,
            },
            include: {
                test: {
                    include: {
                        subject: true,
                        teacher: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        await this.notificationsService.createNotification({
            userId: studentId,
            type: 'TEST',
            title: 'Test Submitted',
            message: `You have successfully submitted the test "${testAttempt.test.title}".`,
            data: {
                testId: testAttempt.test.id,
                testTitle: testAttempt.test.title,
                subjectName: testAttempt.test.subject.name,
                marksObtained,
                totalMarks: testAttempt.test.totalMarks,
            },
        });
        return submittedTest;
    }
    async getTestResults(testId, studentId) {
        const testAttempt = await this.prisma.studentTest.findUnique({
            where: {
                testId_studentId: {
                    testId,
                    studentId,
                },
            },
            include: {
                test: {
                    include: {
                        subject: {
                            include: {
                                class: true,
                            },
                        },
                        teacher: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!testAttempt) {
            throw new common_1.NotFoundException('Test attempt not found');
        }
        if (!testAttempt.submittedAt) {
            throw new common_1.BadRequestException('Test not yet submitted');
        }
        const testWithAnswers = {
            ...testAttempt,
            test: {
                ...testAttempt.test,
                questions: testAttempt.test.questions,
            },
        };
        return testWithAnswers;
    }
    async getTestStats(testId, teacherId, userRole) {
        const test = await this.prisma.test.findUnique({
            where: { id: testId },
            include: {
                attempts: {
                    where: { submittedAt: { not: null } },
                    select: {
                        marksObtained: true,
                        startedAt: true,
                        submittedAt: true,
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                subject: {
                    include: {
                        enrollments: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        });
        if (!test) {
            throw new common_1.NotFoundException('Test not found');
        }
        if (userRole === client_1.Role.TEACHER && test.teacherId !== teacherId) {
            throw new common_1.ForbiddenException('You can only view stats for your own tests');
        }
        const totalStudents = test.subject.enrollments.length;
        const totalAttempts = test.attempts.length;
        const notAttempted = totalStudents - totalAttempts;
        const marks = test.attempts.map(attempt => attempt.marksObtained || 0);
        const avgMarks = marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
        const maxMarks = marks.length > 0 ? Math.max(...marks) : 0;
        const minMarks = marks.length > 0 ? Math.min(...marks) : 0;
        const passMarks = test.totalMarks * 0.4;
        const passedStudents = marks.filter(mark => mark >= passMarks).length;
        const failedStudents = marks.filter(mark => mark < passMarks).length;
        return {
            totalStudents,
            totalAttempts,
            notAttempted,
            attemptRate: totalStudents > 0 ? (totalAttempts / totalStudents) * 100 : 0,
            averageMarks: Math.round(avgMarks * 100) / 100,
            maxMarks,
            minMarks,
            totalMarks: test.totalMarks,
            passedStudents,
            failedStudents,
            passRate: totalAttempts > 0 ? (passedStudents / totalAttempts) * 100 : 0,
            averageTime: this.calculateAverageTime(test.attempts),
        };
    }
    hideAnswersFromQuestions(questions) {
        return questions.map(question => {
            const { correctAnswer, explanation, ...questionWithoutAnswers } = question;
            if (question.type === 'MCQ' || question.type === 'TRUE_FALSE') {
                questionWithoutAnswers.options = question.options?.map((option) => {
                    const { isCorrect, ...optionWithoutCorrect } = option;
                    return optionWithoutCorrect;
                });
            }
            return questionWithoutAnswers;
        });
    }
    calculateMarks(questions, answers) {
        let totalMarks = 0;
        questions.forEach(question => {
            const studentAnswer = answers.find(answer => answer.questionId === question.id);
            if (!studentAnswer)
                return;
            switch (question.type) {
                case create_test_dto_1.QuestionType.MCQ:
                    const correctOption = question.options?.find((opt) => opt.isCorrect);
                    if (correctOption && studentAnswer.selectedOptions?.includes(correctOption.text)) {
                        totalMarks += question.marks;
                    }
                    break;
                case create_test_dto_1.QuestionType.TRUE_FALSE:
                    if (studentAnswer.answer === question.correctAnswer) {
                        totalMarks += question.marks;
                    }
                    break;
                case create_test_dto_1.QuestionType.FILL_BLANK:
                    if (studentAnswer.answer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()) {
                        totalMarks += question.marks;
                    }
                    break;
                case create_test_dto_1.QuestionType.SHORT_ANSWER:
                case create_test_dto_1.QuestionType.ESSAY:
                    break;
            }
        });
        return totalMarks;
    }
    calculateAverageTime(attempts) {
        if (attempts.length === 0)
            return 0;
        const durations = attempts
            .filter(attempt => attempt.startedAt && attempt.submittedAt)
            .map(attempt => (new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000);
        return durations.length > 0
            ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 100) / 100
            : 0;
    }
};
exports.TestsService = TestsService;
exports.TestsService = TestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], TestsService);
//# sourceMappingURL=tests.service.js.map