import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MarkAttendanceDto, BulkMarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceQueryDto, AttendanceStatsQueryDto } from './dto/attendance-query.dto';
import { AttendanceStatus, NotificationType } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async markAttendance(markAttendanceDto: MarkAttendanceDto, markedBy: string) {
    const { sessionId, studentId, status, notes } = markAttendanceDto;

    // Check if session exists
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        subject: {
          include: {
            class: true
          }
        }
      }
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if student is enrolled in the subject
    const enrollment = await this.prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        subjectId: session.subjectId,
        isActive: true
      }
    });

    if (!enrollment) {
      throw new BadRequestException('Student is not enrolled in this subject');
    }

    // Check if attendance already exists
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        studentId_sessionId: {
          studentId,
          sessionId
        }
      }
    });

    if (existingAttendance) {
      // Update existing attendance
      const updatedAttendance = await this.prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status,
          notes,
          markedBy,
          updatedAt: new Date()
        },
        include: {
          student: true,
          session: {
            include: {
              subject: {
                include: {
                  class: true
                }
              }
            }
          }
        }
      });

      return updatedAttendance;
    }

    // Create new attendance record
    const attendance = await this.prisma.attendance.create({
      data: {
        studentId,
        sessionId,
        status,
        notes,
        markedBy
      },
      include: {
        student: true,
        session: {
          include: {
            subject: {
              include: {
                class: true
              }
            }
          }
        }
      }
    });

    // Send notification for absent students
    if (status === AttendanceStatus.ABSENT) {
      await this.notificationsService.createNotification({
        userId: studentId,
        type: NotificationType.CLASS,
        title: 'Absence Notification',
        message: `You were marked absent for ${session.title} (${session.subject.name})`,
        data: {
          sessionId,
          attendanceId: attendance.id,
          subjectName: session.subject.name,
          className: session.subject.class.name
        }
      });
    }

    return attendance;
  }

  async bulkMarkAttendance(bulkMarkAttendanceDto: BulkMarkAttendanceDto, markedBy: string) {
    const { sessionId, attendanceData } = bulkMarkAttendanceDto;

    // Check if session exists
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: {
        subject: {
          include: {
            class: true
          }
        }
      }
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const results: any[] = [];
    
    for (const data of attendanceData) {
      try {
        const attendance = await this.markAttendance({
          sessionId,
          studentId: data.studentId,
          status: data.status,
          notes: data.notes
        }, markedBy);
        results.push({ success: true, attendance });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message, 
          studentId: data.studentId 
        });
      }
    }

    return results;
  }

  async updateAttendance(attendanceId: string, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId }
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: updateAttendanceDto,
      include: {
        student: true,
        session: {
          include: {
            subject: {
              include: {
                class: true
              }
            }
          }
        }
      }
    });
  }

  async getAttendance(query: AttendanceQueryDto) {
    const { 
      studentId, 
      subjectId, 
      sessionId, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = query;

    const where: any = {};

    if (studentId) where.studentId = studentId;
    if (sessionId) where.sessionId = sessionId;
    if (status) where.status = status;

    if (subjectId) {
      where.session = {
        subjectId
      };
    }

    if (startDate || endDate) {
      where.session = {
        ...where.session,
        startTime: {}
      };
      
      if (startDate) where.session.startTime.gte = new Date(startDate);
      if (endDate) where.session.startTime.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [attendance, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          session: {
            include: {
              subject: {
                include: {
                  class: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.attendance.count({ where })
    ]);

    return {
      attendance,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getAttendanceStats(query: AttendanceStatsQueryDto) {
    const { studentId, subjectId, classId, startDate, endDate, period } = query;

    const where: any = {};

    if (studentId) where.studentId = studentId;

    if (subjectId || classId) {
      where.session = {};
      if (subjectId) where.session.subjectId = subjectId;
      if (classId) where.session.subject = { classId };
    }

    if (startDate || endDate) {
      if (!where.session) where.session = {};
      where.session.startTime = {};
      if (startDate) where.session.startTime.gte = new Date(startDate);
      if (endDate) where.session.startTime.lte = new Date(endDate);
    }

    // Get total attendance records
    const totalSessions = await this.prisma.attendance.count({ where });

    // Get attendance by status
    const attendanceByStatus = await this.prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true
      }
    });

    const stats = {
      totalSessions,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      attendancePercentage: 0
    };

    attendanceByStatus.forEach(item => {
      switch (item.status) {
        case AttendanceStatus.PRESENT:
          stats.present = item._count.status;
          break;
        case AttendanceStatus.ABSENT:
          stats.absent = item._count.status;
          break;
        case AttendanceStatus.LATE:
          stats.late = item._count.status;
          break;
        case AttendanceStatus.EXCUSED:
          stats.excused = item._count.status;
          break;
      }
    });

    // Calculate attendance percentage (Present + Late / Total)
    if (totalSessions > 0) {
      stats.attendancePercentage = Math.round(
        ((stats.present + stats.late) / totalSessions) * 100
      );
    }

    return stats;
  }

  async getStudentAttendanceReport(studentId: string, subjectId?: string) {
    const where: any = {
      studentId
    };

    if (subjectId) {
      where.session = {
        subjectId
      };
    }

    const attendance = await this.prisma.attendance.findMany({
      where,
      include: {
        session: {
          include: {
            subject: {
              include: {
                class: true
              }
            }
          }
        }
      },
      orderBy: {
        session: {
          startTime: 'desc'
        }
      }
    });

    // Group by subject
    const reportBySubject: any = {};

    attendance.forEach(record => {
      const subjectKey = record.session?.subject?.id;
      if (!subjectKey) return;
      if (!reportBySubject[subjectKey]) {
        reportBySubject[subjectKey] = {
          subject: record.session?.subject,
          totalSessions: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          attendancePercentage: 0,
          sessions: []
        };
      }

      const subjectData = reportBySubject[subjectKey];
      subjectData.totalSessions++;
      subjectData.sessions.push(record);

      switch (record.status) {
        case AttendanceStatus.PRESENT:
          subjectData.present++;
          break;
        case AttendanceStatus.ABSENT:
          subjectData.absent++;
          break;
        case AttendanceStatus.LATE:
          subjectData.late++;
          break;
        case AttendanceStatus.EXCUSED:
          subjectData.excused++;
          break;
      }

      // Calculate percentage
      subjectData.attendancePercentage = Math.round(
        ((subjectData.present + subjectData.late) / subjectData.totalSessions) * 100
      );
    });

    return Object.values(reportBySubject);
  }

  async getSessionAttendance(sessionId: string) {
    const session = await this.prisma.liveSession.findUnique({
      where: { id: sessionId },
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
                    email: true
                  }
                }
              }
            }
          }
        },
        attendance: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Get all enrolled students
    const enrolledStudents = session.subject.enrollments.map(enrollment => enrollment.student);
    
    // Create attendance map
    const attendanceMap = new Map();
    session.attendance.forEach(record => {
      attendanceMap.set(record.studentId, record);
    });

    // Build complete attendance list
    const completeAttendance = enrolledStudents.map(student => {
      const attendanceRecord = attendanceMap.get(student.id);
      return {
        student,
        attendance: attendanceRecord || null,
        status: attendanceRecord?.status || null
      };
    });

    return {
      session: {
        id: session.id,
        title: session.title,
        startTime: session.startTime,
        endTime: session.endTime,
        subject: session.subject
      },
      attendance: completeAttendance,
      stats: {
        totalStudents: enrolledStudents.length,
        marked: session.attendance.length,
        unmarked: enrolledStudents.length - session.attendance.length
      }
    };
  }

  async deleteAttendance(attendanceId: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId }
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return await this.prisma.attendance.delete({
      where: { id: attendanceId }
    });
  }

  async getAttendanceAlerts() {
    // Get students with low attendance (< 75%) in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const lowAttendanceStudents = await this.prisma.$queryRaw`
      SELECT 
        u.id,
        u."firstName",
        u."lastName",
        u.email,
        s.id as "subjectId",
        s.name as "subjectName",
        c.name as "className",
        COUNT(a.id) as "totalSessions",
        COUNT(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 END) as "attendedSessions",
        ROUND(
          (COUNT(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 END)::decimal / COUNT(a.id)::decimal) * 100, 2
        ) as "attendancePercentage"
      FROM "User" u
      JOIN "StudentEnrollment" se ON u.id = se."studentId"
      JOIN "Subject" s ON se."subjectId" = s.id
      JOIN "Class" c ON s."classId" = c.id
      JOIN "LiveSession" ls ON s.id = ls."subjectId"
      JOIN "Attendance" a ON ls.id = a."sessionId" AND u.id = a."studentId"
      WHERE 
        u.role = 'STUDENT' 
        AND se."isActive" = true
        AND ls."startTime" >= ${thirtyDaysAgo}
      GROUP BY u.id, u."firstName", u."lastName", u.email, s.id, s.name, c.name
      HAVING 
        COUNT(a.id) >= 5 
        AND ROUND(
          (COUNT(CASE WHEN a.status IN ('PRESENT', 'LATE') THEN 1 END)::decimal / COUNT(a.id)::decimal) * 100, 2
        ) < 75
      ORDER BY "attendancePercentage" ASC
    `;

    return lowAttendanceStudents;
  }
}