import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTestDto, QuestionType } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { SubmitTestDto, StartTestDto } from './dto/submit-test.dto';
import { Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TestsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createTestDto: CreateTestDto, teacherId: string) {
    // Verify teacher has access to the subject
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
      throw new ForbiddenException('You do not have permission to create tests for this subject');
    }

    // Validate dates
    const startTime = new Date(createTestDto.startTime);
    const endTime = new Date(createTestDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (startTime <= new Date()) {
      throw new BadRequestException('Start time must be in the future');
    }

    // Process questions with unique IDs
    const questionsWithIds = createTestDto.questions.map(question => ({
      ...question,
      id: uuidv4(),
    }));

    const test = await this.prisma.test.create({
      data: {
        title: createTestDto.title,
        description: createTestDto.description,
        subjectId: createTestDto.subjectId,
        teacherId,
        questions: questionsWithIds as any,
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

    // Send notifications to students
    const studentIds = test.subject.enrollments.map(e => e.studentId);
    if (studentIds.length > 0) {
      const teacherName = `${test.teacher.firstName} ${test.teacher.lastName}`;
      await this.notificationsService.createTestNotification(
        studentIds,
        test.id,
        test.title,
        test.subject.name,
        test.startTime,
        test.duration,
      );
    }

    return test;
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    subjectId?: string,
    teacherId?: string,
    isActive?: boolean,
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (subjectId) where.subjectId = subjectId;
    if (teacherId) where.teacherId = teacherId;
    if (isActive !== undefined) where.isActive = isActive;

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

  async findOne(id: string, userId: string, userRole: Role, includeAnswers = false) {
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
      throw new NotFoundException('Test not found');
    }

    // Check access permissions
    if (userRole === Role.STUDENT) {
      // Students can only see tests they're enrolled in
      const isEnrolled = test.subject.enrollments.some(e => e.studentId === userId);
      if (!isEnrolled) {
        throw new ForbiddenException('You are not enrolled in this subject');
      }
      // Hide answers for students unless they've completed the test and results are shown
      if (!includeAnswers) {
        test.questions = this.hideAnswersFromQuestions(test.questions as any[]);
      }
    } else if (userRole === Role.TEACHER && test.teacherId !== userId) {
      // Teachers can only see their own tests (unless admin)
      throw new ForbiddenException('You can only view your own tests');
    }

    return test;
  }

  async findStudentTests(studentId: string, page = 1, limit = 10, status?: 'upcoming' | 'ongoing' | 'completed') {
    const skip = (page - 1) * limit;
    const currentTime = new Date();
    
    const where: any = {
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
    } else if (status === 'ongoing') {
      where.AND = [
        { startTime: { lte: currentTime } },
        { endTime: { gte: currentTime } },
      ];
    } else if (status === 'completed') {
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

    // Hide answers from questions for students
    const testsWithHiddenAnswers = tests.map(test => ({
      ...test,
      questions: this.hideAnswersFromQuestions(test.questions as any[]),
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

  async update(id: string, updateTestDto: UpdateTestDto, teacherId: string, userRole: Role) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        attempts: true,
      },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    // Check permissions
    if (userRole === Role.TEACHER && test.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update your own tests');
    }

    // Check if test has already started
    if (new Date() >= test.startTime) {
      throw new BadRequestException('Cannot update test that has already started');
    }

    // Check if there are any attempts
    if (test.attempts.length > 0) {
      throw new BadRequestException('Cannot update test that has student attempts');
    }

    const updateData: any = { ...updateTestDto };
    if (updateTestDto.startTime) {
      updateData.startTime = new Date(updateTestDto.startTime);
    }
    if (updateTestDto.endTime) {
      updateData.endTime = new Date(updateTestDto.endTime);
    }

    // Process questions with IDs if provided
    if (updateTestDto.questions) {
      updateData.questions = updateTestDto.questions.map(question => ({
        ...question,
        id: uuidv4(),
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

  async remove(id: string, teacherId: string, userRole: Role) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: {
        attempts: true,
      },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    // Check permissions
    if (userRole === Role.TEACHER && test.teacherId !== teacherId) {
      throw new ForbiddenException('You can only delete your own tests');
    }

    // Check if any attempts exist
    if (test.attempts.length > 0) {
      // Soft delete by setting isActive to false
      await this.prisma.test.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Test deactivated successfully (attempts exist)' };
    } else {
      // Hard delete if no attempts
      await this.prisma.test.delete({
        where: { id },
      });
      return { message: 'Test deleted successfully' };
    }
  }

  async startTest(startDto: StartTestDto, studentId: string) {
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
      throw new NotFoundException('Test not found or inactive');
    }

    // Check if student is enrolled
    if (test.subject.enrollments.length === 0) {
      throw new ForbiddenException('You are not enrolled in this subject');
    }

    const currentTime = new Date();

    // Check if test is available
    if (currentTime < test.startTime) {
      throw new BadRequestException('Test has not started yet');
    }

    if (currentTime > test.endTime) {
      throw new BadRequestException('Test has ended');
    }

    // Check for existing attempts
    const existingAttempts = test.attempts.filter(attempt => !attempt.submittedAt);
    if (existingAttempts.length > 0) {
      return existingAttempts[0]; // Return ongoing attempt
    }

    // Check if student has already completed this test (single attempt only)
    if (test.attempts.some(attempt => attempt.submittedAt)) {
      throw new BadRequestException('You have already completed this test');
    }

    // Create new test attempt
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

    // Hide answers from questions
    const testWithHiddenAnswers = {
      ...testAttempt,
      test: {
        ...testAttempt.test,
        questions: this.hideAnswersFromQuestions((testAttempt.test as any).questions as any[]),
      },
    };

    return testWithHiddenAnswers;
  }

  async submitTest(submitDto: SubmitTestDto, studentId: string) {
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
      throw new NotFoundException('Test attempt not found');
    }

    if (testAttempt.submittedAt) {
      throw new BadRequestException('Test already submitted');
    }

    const currentTime = new Date();
    const timeLimit = new Date(testAttempt.startedAt.getTime() + testAttempt.test.duration * 60000);

    // Check if time limit exceeded
    if (currentTime > timeLimit || currentTime > testAttempt.test.endTime) {
      // Auto-submit with current answers
      const autoSubmission = await this.prisma.studentTest.update({
        where: {
          testId_studentId: {
            testId: submitDto.testId,
            studentId,
          },
        },
        data: {
          answers: submitDto.answers as any,
          submittedAt: currentTime,
          marksObtained: 0, // Will be calculated by grading
        },
      });
      throw new BadRequestException('Time limit exceeded. Test auto-submitted.');
    }

    // Calculate marks for auto-gradable questions
    const marksObtained = this.calculateMarks(testAttempt.test.questions as any[], submitDto.answers);

    const submittedTest = await this.prisma.studentTest.update({
      where: {
        testId_studentId: {
          testId: submitDto.testId,
          studentId,
        },
      },
      data: {
        answers: submitDto.answers as any,
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

    // Send notification to student about test completion
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

  async getTestResults(testId: string, studentId: string) {
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
      throw new NotFoundException('Test attempt not found');
    }

    if (!testAttempt.submittedAt) {
      throw new BadRequestException('Test not yet submitted');
    }

    // Include correct answers for completed tests
    const testWithAnswers = {
      ...testAttempt,
      test: {
        ...testAttempt.test,
        questions: testAttempt.test.questions,
      },
    };

    return testWithAnswers;
  }

  async getTestStats(testId: string, teacherId: string, userRole: Role) {
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
      throw new NotFoundException('Test not found');
    }

    // Check permissions
    if (userRole === Role.TEACHER && test.teacherId !== teacherId) {
      throw new ForbiddenException('You can only view stats for your own tests');
    }

    const totalStudents = test.subject.enrollments.length;
    const totalAttempts = test.attempts.length;
    const notAttempted = totalStudents - totalAttempts;

    const marks = test.attempts.map(attempt => attempt.marksObtained || 0);
    const avgMarks = marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
    const maxMarks = marks.length > 0 ? Math.max(...marks) : 0;
    const minMarks = marks.length > 0 ? Math.min(...marks) : 0;

    const passMarks = test.totalMarks * 0.4; // 40% pass criteria
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

  private hideAnswersFromQuestions(questions: any[]): any[] {
    return questions.map(question => {
      const { correctAnswer, explanation, ...questionWithoutAnswers } = question;
      
      if (question.type === 'MCQ' || question.type === 'TRUE_FALSE') {
        questionWithoutAnswers.options = question.options?.map((option: any) => {
          const { isCorrect, ...optionWithoutCorrect } = option;
          return optionWithoutCorrect;
        });
      }
      
      return questionWithoutAnswers;
    });
  }

  private calculateMarks(questions: any[], answers: any[]): number {
    let totalMarks = 0;

    questions.forEach(question => {
      const studentAnswer = answers.find(answer => answer.questionId === question.id);
      
      if (!studentAnswer) return;

      switch (question.type) {
        case QuestionType.MCQ:
          const correctOption = question.options?.find((opt: any) => opt.isCorrect);
          if (correctOption && studentAnswer.selectedOptions?.includes(correctOption.text)) {
            totalMarks += question.marks;
          }
          break;

        case QuestionType.TRUE_FALSE:
          if (studentAnswer.answer === question.correctAnswer) {
            totalMarks += question.marks;
          }
          break;

        case QuestionType.FILL_BLANK:
          if (studentAnswer.answer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()) {
            totalMarks += question.marks;
          }
          break;

        // SHORT_ANSWER and ESSAY require manual grading
        case QuestionType.SHORT_ANSWER:
        case QuestionType.ESSAY:
          // These will be graded manually by teachers
          break;
      }
    });

    return totalMarks;
  }

  private calculateAverageTime(attempts: any[]): number {
    if (attempts.length === 0) return 0;

    const durations = attempts
      .filter(attempt => attempt.startedAt && attempt.submittedAt)
      .map(attempt => 
        (new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000
      );

    return durations.length > 0 
      ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 100) / 100 
      : 0;
  }
}