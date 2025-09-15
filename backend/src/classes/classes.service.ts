import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto) {
    try {
      const newClass = await this.prisma.class.create({
        data: createClassDto,
        include: {
          subjects: {
            include: {
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
          announcements: true,
          _count: {
            select: {
              subjects: true,
            },
          },
        },
      });

      return newClass;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('A class with this name already exists');
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 10, search?: string, isActive?: boolean) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { grade: { contains: search, mode: 'insensitive' } },
        { academicYear: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [classes, total] = await Promise.all([
      this.prisma.class.findMany({
        where,
        skip,
        take: limit,
        include: {
          subjects: {
            include: {
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
            },
          },
          announcements: {
            where: { isActive: true },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              subjects: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.class.count({ where }),
    ]);

    return {
      classes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
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
            assignments: {
              where: { isActive: true },
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
            tests: {
              where: { isActive: true },
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
            materials: {
              where: { isActive: true },
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        announcements: {
          where: { isActive: true },
          include: {
            author: {
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
            subjects: true,
          },
        },
      },
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    return classData;
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    try {
      const updatedClass = await this.prisma.class.update({
        where: { id },
        data: updateClassDto,
        include: {
          subjects: {
            include: {
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
          announcements: true,
          _count: {
            select: {
              subjects: true,
            },
          },
        },
      });

      return updatedClass;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Class not found');
      }
      if (error.code === 'P2002') {
        throw new ConflictException('A class with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Check if class has any active subjects/enrollments
      const classWithRelations = await this.prisma.class.findUnique({
        where: { id },
        include: {
          subjects: {
            include: {
              enrollments: {
                where: { isActive: true },
              },
            },
          },
        },
      });

      if (!classWithRelations) {
        throw new NotFoundException('Class not found');
      }

      const hasActiveEnrollments = classWithRelations.subjects.some(
        subject => subject.enrollments.length > 0
      );

      if (hasActiveEnrollments) {
        throw new ConflictException(
          'Cannot delete class with active enrollments. Please deactivate enrollments first.'
        );
      }

      await this.prisma.class.delete({
        where: { id },
      });

      return { message: 'Class deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Class not found');
      }
      throw error;
    }
  }

  async getClassStats(id: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            enrollments: {
              where: { isActive: true },
            },
            teachers: true,
            assignments: {
              where: { isActive: true },
            },
            tests: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!classData) {
      throw new NotFoundException('Class not found');
    }

    const totalStudents = classData.subjects.reduce(
      (acc, subject) => acc + subject.enrollments.length,
      0
    );

    const totalTeachers = new Set(
      classData.subjects.flatMap(subject => subject.teachers.map(t => t.teacherId))
    ).size;

    const totalAssignments = classData.subjects.reduce(
      (acc, subject) => acc + subject.assignments.length,
      0
    );

    const totalTests = classData.subjects.reduce(
      (acc, subject) => acc + subject.tests.length,
      0
    );

    return {
      totalSubjects: classData.subjects.length,
      totalStudents,
      totalTeachers,
      totalAssignments,
      totalTests,
    };
  }
}