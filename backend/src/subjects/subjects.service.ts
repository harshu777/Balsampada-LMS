import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    // Check if class exists
    const classExists = await this.prisma.class.findUnique({
      where: { id: createSubjectDto.classId },
    });

    if (!classExists) {
      throw new BadRequestException('Class not found');
    }

    try {
      const newSubject = await this.prisma.subject.create({
        data: createSubjectDto,
        include: {
          class: true,
          teachers: {
            include: {
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
          _count: {
            select: {
              teachers: true,
              enrollments: true,
              materials: true,
              assignments: true,
              tests: true,
            },
          },
        },
      });

      return newSubject;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('A subject with this name already exists in this class');
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, search?: string, classId?: string, isActive?: boolean) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (classId) {
      where.classId = classId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [subjects, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        skip,
        take: limit,
        include: {
          class: true,
          teachers: {
            include: {
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
          _count: {
            select: {
              teachers: true,
              enrollments: true,
              materials: true,
              assignments: true,
              tests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subject.count({ where }),
    ]);

    return {
      subjects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        class: true,
        teachers: {
          include: {
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
        materials: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        assignments: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        tests: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            teachers: true,
            enrollments: true,
            materials: true,
            assignments: true,
            tests: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    // If classId is being updated, check if the new class exists
    if (updateSubjectDto.classId) {
      const classExists = await this.prisma.class.findUnique({
        where: { id: updateSubjectDto.classId },
      });

      if (!classExists) {
        throw new BadRequestException('Class not found');
      }
    }

    try {
      const updatedSubject = await this.prisma.subject.update({
        where: { id },
        data: updateSubjectDto,
        include: {
          class: true,
          teachers: {
            include: {
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
          _count: {
            select: {
              teachers: true,
              enrollments: true,
              materials: true,
              assignments: true,
              tests: true,
            },
          },
        },
      });

      return updatedSubject;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Subject not found');
      }
      if (error.code === 'P2002') {
        throw new ConflictException('A subject with this name already exists in this class');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Check if subject has any active enrollments
      const subjectWithEnrollments = await this.prisma.subject.findUnique({
        where: { id },
        include: {
          enrollments: {
            where: { isActive: true },
          },
        },
      });

      if (!subjectWithEnrollments) {
        throw new NotFoundException('Subject not found');
      }

      if (subjectWithEnrollments.enrollments.length > 0) {
        throw new ConflictException(
          'Cannot delete subject with active enrollments. Please deactivate enrollments first.'
        );
      }

      await this.prisma.subject.delete({
        where: { id },
      });

      return { message: 'Subject deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Subject not found');
      }
      throw error;
    }
  }

  async assignTeacher(subjectId: string, teacherId: string) {
    // Check if subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    // Check if teacher exists and has TEACHER role
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId, role: 'TEACHER' },
    });

    if (!teacher) {
      throw new BadRequestException('Teacher not found or user is not a teacher');
    }

    try {
      const assignment = await this.prisma.teacherSubject.create({
        data: {
          teacherId,
          subjectId,
        },
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          subject: {
            include: {
              class: true,
            },
          },
        },
      });

      return assignment;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Teacher is already assigned to this subject');
      }
      throw error;
    }
  }

  async unassignTeacher(subjectId: string, teacherId: string) {
    try {
      await this.prisma.teacherSubject.delete({
        where: {
          teacherId_subjectId: {
            teacherId,
            subjectId,
          },
        },
      });

      return { message: 'Teacher unassigned successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Teacher assignment not found');
      }
      throw error;
    }
  }

  async getSubjectStats(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        teachers: true,
        enrollments: {
          where: { isActive: true },
        },
        materials: {
          where: { isActive: true },
        },
        assignments: {
          where: { isActive: true },
        },
        tests: {
          where: { isActive: true },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return {
      totalTeachers: subject.teachers.length,
      totalStudents: subject.enrollments.length,
      totalMaterials: subject.materials.length,
      totalAssignments: subject.assignments.length,
      totalTests: subject.tests.length,
    };
  }

  async findByTeacher(teacherId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [subjects, total] = await Promise.all([
      this.prisma.subject.findMany({
        where: {
          teachers: {
            some: {
              teacherId,
              isActive: true,
            },
          },
          isActive: true,
        },
        skip,
        take: limit,
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
          _count: {
            select: {
              enrollments: true,
              materials: true,
              assignments: true,
              tests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subject.count({
        where: {
          teachers: {
            some: {
              teacherId,
              isActive: true,
            },
          },
          isActive: true,
        },
      }),
    ]);

    return {
      subjects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}