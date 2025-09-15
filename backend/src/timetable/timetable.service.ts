import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimetableDto, UpdateTimetableDto } from './dto/timetable.dto';
import { startOfWeek, endOfWeek, startOfDay, endOfDay, addMinutes, isWithinInterval } from 'date-fns';

@Injectable()
export class TimetableService {
  constructor(private prisma: PrismaService) {}

  async create(createTimetableDto: CreateTimetableDto, userId: string) {
    // Verify the user is admin or teacher for the subject
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { teacherSubjects: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.role === 'TEACHER') {
      const isTeaching = user.teacherSubjects.some(
        ts => ts.subjectId === createTimetableDto.subjectId && ts.isActive
      );
      if (!isTeaching) {
        throw new ForbiddenException('You can only create timetable for subjects you teach');
      }
    } else if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin and teachers can create timetables');
    }

    // Check for time conflicts
    const conflicts = await this.checkTimeConflicts(createTimetableDto);
    if (conflicts.length > 0) {
      throw new BadRequestException('Time slot conflicts with existing sessions');
    }

    return this.prisma.timetable.create({
      data: {
        subjectId: createTimetableDto.subjectId,
        dayOfWeek: createTimetableDto.dayOfWeek,
        startTime: createTimetableDto.startTime,
        endTime: createTimetableDto.endTime,
        roomNumber: createTimetableDto.roomNumber,
        isRecurring: createTimetableDto.isRecurring,
        startDate: createTimetableDto.startDate,
        endDate: createTimetableDto.endDate,
      },
      include: {
        subject: {
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
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: string, startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (userRole === 'STUDENT') {
      const enrollments = await this.prisma.studentEnrollment.findMany({
        where: { studentId: userId, isActive: true },
        select: { subjectId: true },
      });
      where.subjectId = { in: enrollments.map(e => e.subjectId) };
    } else if (userRole === 'TEACHER') {
      const teacherSubjects = await this.prisma.teacherSubject.findMany({
        where: { teacherId: userId, isActive: true },
        select: { subjectId: true },
      });
      where.subjectId = { in: teacherSubjects.map(ts => ts.subjectId) };
    }

    if (startDate && endDate) {
      where.OR = [
        {
          isRecurring: true,
          startDate: { lte: endDate },
          OR: [
            { endDate: null },
            { endDate: { gte: startDate } },
          ],
        },
        {
          isRecurring: false,
          startDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      ];
    }

    return this.prisma.timetable.findMany({
      where,
      include: {
        subject: {
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
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async findByWeek(userId: string, userRole: string, date: Date = new Date()) {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

    return this.findAll(userId, userRole, weekStart, weekEnd);
  }

  async findByDay(userId: string, userRole: string, date: Date = new Date()) {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const dayOfWeek = date.getDay();

    const where: any = {
      dayOfWeek,
      OR: [
        {
          isRecurring: true,
          startDate: { lte: dayEnd },
          OR: [
            { endDate: null },
            { endDate: { gte: dayStart } },
          ],
        },
        {
          isRecurring: false,
          startDate: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      ],
    };

    if (userRole === 'STUDENT') {
      const enrollments = await this.prisma.studentEnrollment.findMany({
        where: { studentId: userId, isActive: true },
        select: { subjectId: true },
      });
      where.subjectId = { in: enrollments.map(e => e.subjectId) };
    } else if (userRole === 'TEACHER') {
      const teacherSubjects = await this.prisma.teacherSubject.findMany({
        where: { teacherId: userId, isActive: true },
        select: { subjectId: true },
      });
      where.subjectId = { in: teacherSubjects.map(ts => ts.subjectId) };
    }

    return this.prisma.timetable.findMany({
      where,
      include: {
        subject: {
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
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const timetable = await this.prisma.timetable.findUnique({
      where: { id },
      include: {
        subject: {
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
          },
        },
      },
    });

    if (!timetable) {
      throw new NotFoundException('Timetable entry not found');
    }

    return timetable;
  }

  async update(id: string, updateTimetableDto: UpdateTimetableDto, userId: string) {
    const timetable = await this.prisma.timetable.findUnique({
      where: { id },
      include: {
        subject: {
          include: {
            teachers: true,
          },
        },
      },
    });

    if (!timetable) {
      throw new NotFoundException('Timetable entry not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.role === 'TEACHER') {
      const isTeaching = timetable.subject.teachers.some(
        ts => ts.teacherId === userId && ts.isActive
      );
      if (!isTeaching) {
        throw new ForbiddenException('You can only update timetable for subjects you teach');
      }
    } else if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin and teachers can update timetables');
    }

    // Check for time conflicts if time is being changed
    if (updateTimetableDto.startTime || updateTimetableDto.endTime || updateTimetableDto.dayOfWeek) {
      const conflicts = await this.checkTimeConflicts({
        ...timetable,
        ...updateTimetableDto,
      }, id);
      if (conflicts.length > 0) {
        throw new BadRequestException('Time slot conflicts with existing sessions');
      }
    }

    return this.prisma.timetable.update({
      where: { id },
      data: updateTimetableDto,
      include: {
        subject: {
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
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const timetable = await this.prisma.timetable.findUnique({
      where: { id },
      include: {
        subject: {
          include: {
            teachers: true,
          },
        },
      },
    });

    if (!timetable) {
      throw new NotFoundException('Timetable entry not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (user.role === 'TEACHER') {
      const isTeaching = timetable.subject.teachers.some(
        ts => ts.teacherId === userId && ts.isActive
      );
      if (!isTeaching) {
        throw new ForbiddenException('You can only delete timetable for subjects you teach');
      }
    } else if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin and teachers can delete timetables');
    }

    return this.prisma.timetable.delete({
      where: { id },
    });
  }

  private async checkTimeConflicts(timetableData: any, excludeId?: string): Promise<any[]> {
    const where: any = {
      dayOfWeek: timetableData.dayOfWeek,
      subjectId: timetableData.subjectId,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingTimetables = await this.prisma.timetable.findMany({
      where,
    });

    return existingTimetables.filter(existing => {
      const existingStart = this.timeToMinutes(existing.startTime);
      const existingEnd = this.timeToMinutes(existing.endTime);
      const newStart = this.timeToMinutes(timetableData.startTime);
      const newEnd = this.timeToMinutes(timetableData.endTime);

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async getUpcomingSessions(userId: string, userRole: string, limit = 5) {
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const where: any = {
      OR: [
        {
          dayOfWeek: currentDayOfWeek,
          startTime: { gt: currentTime },
        },
        {
          dayOfWeek: { gt: currentDayOfWeek },
        },
      ],
      isRecurring: true,
    };

    if (userRole === 'STUDENT') {
      const enrollments = await this.prisma.studentEnrollment.findMany({
        where: { studentId: userId, isActive: true },
        select: { subjectId: true },
      });
      where.subjectId = { in: enrollments.map(e => e.subjectId) };
    } else if (userRole === 'TEACHER') {
      const teacherSubjects = await this.prisma.teacherSubject.findMany({
        where: { teacherId: userId, isActive: true },
        select: { subjectId: true },
      });
      where.subjectId = { in: teacherSubjects.map(ts => ts.subjectId) };
    }

    return this.prisma.timetable.findMany({
      where,
      include: {
        subject: {
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
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
      take: limit,
    });
  }
}