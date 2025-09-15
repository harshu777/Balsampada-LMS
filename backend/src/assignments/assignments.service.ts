import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto, GradeAssignmentDto } from './dto/submit-assignment.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AssignmentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto, teacherId: string) {
    // Verify teacher has access to the subject
    const teacherSubject = await this.prisma.teacherSubject.findFirst({
      where: {
        teacherId,
        subjectId: createAssignmentDto.subjectId,
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
      throw new ForbiddenException('You do not have permission to create assignments for this subject');
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        ...createAssignmentDto,
        teacherId,
        dueDate: new Date(createAssignmentDto.dueDate),
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

    // Create student assignment records for all enrolled students
    const studentIds = assignment.subject.enrollments.map(e => e.studentId);
    if (studentIds.length > 0) {
      await this.prisma.studentAssignment.createMany({
        data: studentIds.map(studentId => ({
          assignmentId: assignment.id,
          studentId,
        })),
      });

      // Send notifications to students
      const teacherName = `${assignment.teacher.firstName} ${assignment.teacher.lastName}`;
      await this.notificationsService.createAssignmentNotification(
        studentIds,
        assignment.id,
        assignment.title,
        assignment.subject.name,
        assignment.dueDate,
        teacherName,
      );
    }

    return assignment;
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

    const [assignments, total] = await Promise.all([
      this.prisma.assignment.findMany({
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
          submissions: {
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
              submissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.assignment.count({ where }),
    ]);

    return {
      assignments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string, userRole: Role) {
    const assignment = await this.prisma.assignment.findUnique({
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
        submissions: {
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
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check access permissions
    if (userRole === Role.STUDENT) {
      // Students can only see assignments they're enrolled in
      const isEnrolled = assignment.subject.enrollments.some(e => e.studentId === userId);
      if (!isEnrolled) {
        throw new ForbiddenException('You are not enrolled in this subject');
      }
    } else if (userRole === Role.TEACHER && assignment.teacherId !== userId) {
      // Teachers can only see their own assignments (unless admin)
      throw new ForbiddenException('You can only view your own assignments');
    }

    return assignment;
  }

  async findStudentAssignments(studentId: string, page = 1, limit = 10, status?: 'pending' | 'submitted' | 'graded') {
    const skip = (page - 1) * limit;
    
    const where: any = {
      studentId,
      assignment: { isActive: true },
    };

    if (status === 'pending') {
      where.submittedAt = null;
    } else if (status === 'submitted') {
      where.submittedAt = { not: null };
      where.gradedAt = null;
    } else if (status === 'graded') {
      where.gradedAt = { not: null };
    }

    const [assignments, total] = await Promise.all([
      this.prisma.studentAssignment.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignment: {
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
        orderBy: { assignment: { dueDate: 'asc' } },
      }),
      this.prisma.studentAssignment.count({ where }),
    ]);

    return {
      assignments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentDto, teacherId: string, userRole: Role) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check permissions
    if (userRole === Role.TEACHER && assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update your own assignments');
    }

    const updateData: any = { ...updateAssignmentDto };
    if (updateAssignmentDto.dueDate) {
      updateData.dueDate = new Date(updateAssignmentDto.dueDate);
    }

    const updatedAssignment = await this.prisma.assignment.update({
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
        submissions: {
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
            submissions: true,
          },
        },
      },
    });

    return updatedAssignment;
  }

  async remove(id: string, teacherId: string, userRole: Role) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        submissions: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check permissions
    if (userRole === Role.TEACHER && assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You can only delete your own assignments');
    }

    // Check if any submissions exist
    if (assignment.submissions.length > 0) {
      // Soft delete by setting isActive to false
      await this.prisma.assignment.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Assignment deactivated successfully (submissions exist)' };
    } else {
      // Hard delete if no submissions
      await this.prisma.assignment.delete({
        where: { id },
      });
      return { message: 'Assignment deleted successfully' };
    }
  }

  async submitAssignment(submitDto: SubmitAssignmentDto, studentId: string, attachmentUrl?: string) {
    // Check if assignment exists and is active
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: submitDto.assignmentId },
      include: {
        subject: {
          include: {
            enrollments: {
              where: { studentId, isActive: true },
            },
          },
        },
      },
    });

    if (!assignment || !assignment.isActive) {
      throw new NotFoundException('Assignment not found or inactive');
    }

    // Check if student is enrolled
    if (assignment.subject.enrollments.length === 0) {
      throw new ForbiddenException('You are not enrolled in this subject');
    }

    // Check if assignment is past due
    if (new Date() > assignment.dueDate) {
      throw new BadRequestException('Assignment submission deadline has passed');
    }

    // Check if already submitted
    const existingSubmission = await this.prisma.studentAssignment.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: submitDto.assignmentId,
          studentId,
        },
      },
    });

    if (!existingSubmission) {
      throw new NotFoundException('Student assignment record not found');
    }

    if (existingSubmission.submittedAt) {
      throw new BadRequestException('Assignment already submitted');
    }

    const submissionData: any = {
      submittedAt: new Date(),
    };

    if (submitDto.submissionText) {
      submissionData.submissionText = submitDto.submissionText;
    }

    if (attachmentUrl || submitDto.submissionUrl) {
      submissionData.submissionUrl = attachmentUrl || submitDto.submissionUrl;
    }

    const submission = await this.prisma.studentAssignment.update({
      where: {
        assignmentId_studentId: {
          assignmentId: submitDto.assignmentId,
          studentId,
        },
      },
      data: submissionData,
      include: {
        assignment: {
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

    return submission;
  }

  async gradeAssignment(gradeDto: GradeAssignmentDto, teacherId: string, userRole: Role) {
    const studentAssignment = await this.prisma.studentAssignment.findUnique({
      where: { id: gradeDto.studentAssignmentId },
      include: {
        assignment: {
          include: {
            subject: true,
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

    if (!studentAssignment) {
      throw new NotFoundException('Student assignment not found');
    }

    // Check permissions
    if (userRole === Role.TEACHER && studentAssignment.assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You can only grade assignments from your subjects');
    }

    if (!studentAssignment.submittedAt) {
      throw new BadRequestException('Cannot grade unsubmitted assignment');
    }

    // Validate marks if provided
    if (gradeDto.marksObtained !== undefined && studentAssignment.assignment.totalMarks) {
      if (gradeDto.marksObtained > studentAssignment.assignment.totalMarks) {
        throw new BadRequestException('Marks obtained cannot exceed total marks');
      }
      if (gradeDto.marksObtained < 0) {
        throw new BadRequestException('Marks obtained cannot be negative');
      }
    }

    const gradedAssignment = await this.prisma.studentAssignment.update({
      where: { id: gradeDto.studentAssignmentId },
      data: {
        marksObtained: gradeDto.marksObtained,
        feedback: gradeDto.feedback,
        gradedAt: new Date(),
      },
      include: {
        assignment: {
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

    // Send notification to student about grading
    await this.notificationsService.createNotification({
      userId: studentAssignment.student.id,
      type: 'ASSIGNMENT',
      title: 'Assignment Graded',
      message: `Your assignment "${studentAssignment.assignment.title}" has been graded.`,
      data: {
        assignmentId: studentAssignment.assignment.id,
        studentAssignmentId: studentAssignment.id,
        marksObtained: gradeDto.marksObtained,
        totalMarks: studentAssignment.assignment.totalMarks,
        feedback: gradeDto.feedback,
      },
    });

    return gradedAssignment;
  }

  async getAssignmentStats(assignmentId: string, teacherId: string, userRole: Role) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        submissions: {
          select: {
            submittedAt: true,
            gradedAt: true,
            marksObtained: true,
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

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check permissions
    if (userRole === Role.TEACHER && assignment.teacherId !== teacherId) {
      throw new ForbiddenException('You can only view stats for your own assignments');
    }

    const totalStudents = assignment.subject.enrollments.length;
    const totalSubmissions = assignment.submissions.filter(s => s.submittedAt).length;
    const pendingSubmissions = totalStudents - totalSubmissions;
    const gradedSubmissions = assignment.submissions.filter(s => s.gradedAt).length;
    const pendingGrading = totalSubmissions - gradedSubmissions;

    const marks = assignment.submissions
      .filter(s => s.marksObtained !== null)
      .map(s => s.marksObtained!);

    const avgMarks = marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
    const maxMarks = marks.length > 0 ? Math.max(...marks) : 0;
    const minMarks = marks.length > 0 ? Math.min(...marks) : 0;

    return {
      totalStudents,
      totalSubmissions,
      pendingSubmissions,
      gradedSubmissions,
      pendingGrading,
      submissionRate: totalStudents > 0 ? (totalSubmissions / totalStudents) * 100 : 0,
      gradingRate: totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0,
      averageMarks: Math.round(avgMarks * 100) / 100,
      maxMarks,
      minMarks,
      totalMarks: assignment.totalMarks,
    };
  }
}