import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLiveSessionDto } from './dto/create-live-session.dto';
import { UpdateLiveSessionDto } from './dto/update-live-session.dto';
import { Role } from '@prisma/client';

@Injectable()
export class LiveSessionsService {
  constructor(private prisma: PrismaService) {}

  async create(createLiveSessionDto: CreateLiveSessionDto, teacherId: string) {
    // Verify teacher is assigned to this subject
    const teacherSubject = await this.prisma.teacherSubject.findFirst({
      where: {
        teacherId,
        subjectId: createLiveSessionDto.subjectId,
        isActive: true,
      },
    });

    if (!teacherSubject) {
      throw new ForbiddenException('You are not assigned to teach this subject');
    }

    return this.prisma.liveSession.create({
      data: {
        ...createLiveSessionDto,
        teacherId,
        startTime: new Date(createLiveSessionDto.startTime),
        endTime: new Date(createLiveSessionDto.endTime),
      },
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
    });
  }

  async findAll(userId: string, userRole: Role) {
    const where: any = { isActive: true };

    if (userRole === Role.TEACHER) {
      where.teacherId = userId;
    } else if (userRole === Role.STUDENT) {
      // Get student's enrolled subjects
      const enrollments = await this.prisma.studentEnrollment.findMany({
        where: {
          studentId: userId,
          isActive: true,
        },
        select: {
          subjectId: true,
        },
      });
      
      const subjectIds = enrollments.map(e => e.subjectId);
      where.subjectId = { in: subjectIds };
    }

    return this.prisma.liveSession.findMany({
      where,
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
        _count: {
          select: {
            attendees: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id },
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
        attendees: {
          include: {
            user: {
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

    if (!session) {
      throw new NotFoundException('Live session not found');
    }

    return session;
  }

  async update(id: string, updateLiveSessionDto: UpdateLiveSessionDto, teacherId: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Live session not found');
    }

    if (session.teacherId !== teacherId) {
      throw new ForbiddenException('You can only update your own sessions');
    }

    const updateData: any = { ...updateLiveSessionDto };
    if (updateLiveSessionDto.startTime) {
      updateData.startTime = new Date(updateLiveSessionDto.startTime);
    }
    if (updateLiveSessionDto.endTime) {
      updateData.endTime = new Date(updateLiveSessionDto.endTime);
    }

    return this.prisma.liveSession.update({
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
      },
    });
  }

  async remove(id: string, teacherId: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Live session not found');
    }

    if (session.teacherId !== teacherId) {
      throw new ForbiddenException('You can only delete your own sessions');
    }

    return this.prisma.liveSession.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async joinSession(sessionId: string, userId: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Live session not found');
    }

    // Check if already joined
    const existingAttendee = await this.prisma.sessionAttendee.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });

    if (existingAttendee) {
      return existingAttendee;
    }

    return this.prisma.sessionAttendee.create({
      data: {
        sessionId,
        userId,
      },
    });
  }

  async leaveSession(sessionId: string, userId: string) {
    const attendee = await this.prisma.sessionAttendee.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });

    if (!attendee) {
      throw new NotFoundException('You have not joined this session');
    }

    return this.prisma.sessionAttendee.update({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
      data: {
        leftAt: new Date(),
      },
    });
  }

  async getUpcomingSessions(userId: string, userRole: Role) {
    const now = new Date();
    const where: any = {
      isActive: true,
      startTime: {
        gte: now,
      },
    };

    if (userRole === Role.TEACHER) {
      where.teacherId = userId;
    } else if (userRole === Role.STUDENT) {
      const enrollments = await this.prisma.studentEnrollment.findMany({
        where: {
          studentId: userId,
          isActive: true,
        },
        select: {
          subjectId: true,
        },
      });
      
      const subjectIds = enrollments.map(e => e.subjectId);
      where.subjectId = { in: subjectIds };
    }

    return this.prisma.liveSession.findMany({
      where,
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
      orderBy: {
        startTime: 'asc',
      },
      take: 5,
    });
  }
}