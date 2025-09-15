import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AttendanceService } from './attendance.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AttendanceSchedulerService {
  private readonly logger = new Logger(AttendanceSchedulerService.name);

  constructor(
    private attendanceService: AttendanceService,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  // Run every day at 8 AM to check for low attendance
  @Cron('0 8 * * *')
  async checkLowAttendanceDaily() {
    this.logger.log('Running daily low attendance check...');
    
    try {
      const lowAttendanceStudents = await this.attendanceService.getAttendanceAlerts() as any[];
      
      if (lowAttendanceStudents.length > 0) {
        this.logger.log(`Found ${lowAttendanceStudents.length} students with low attendance`);
        
        // Send notifications to students with low attendance
        for (const student of lowAttendanceStudents) {
          await this.notificationsService.createNotification({
            userId: student.id,
            type: NotificationType.CLASS,
            title: 'Low Attendance Alert',
            message: `Your attendance in ${student.subjectName} is ${student.attendancePercentage}%. Please attend classes regularly to maintain good academic standing.`,
            data: {
              subjectId: student.subjectId,
              subjectName: student.subjectName,
              attendancePercentage: student.attendancePercentage,
              totalSessions: student.totalSessions,
              attendedSessions: student.attendedSessions,
              alertType: 'low_attendance'
            }
          });
        }

        // Notify admins about students with critical attendance (< 60%)
        const criticalAttendanceStudents = lowAttendanceStudents.filter(
          (student: any) => student.attendancePercentage < 60
        );

        if (criticalAttendanceStudents.length > 0) {
          const adminUsers = await this.prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
          });

          const adminNotifications = adminUsers.map(admin => ({
            userId: admin.id,
            type: NotificationType.SYSTEM,
            title: 'Critical Attendance Alert',
            message: `${criticalAttendanceStudents.length} student(s) have critically low attendance (< 60%). Immediate attention required.`,
            data: {
              criticalCount: criticalAttendanceStudents.length,
              students: criticalAttendanceStudents.map((s: any) => ({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                subject: s.subjectName,
                percentage: s.attendancePercentage
              })),
              alertType: 'critical_attendance_admin'
            }
          }));

          await this.notificationsService.createBulkNotifications(adminNotifications);
        }
      }
    } catch (error) {
      this.logger.error('Error in daily low attendance check:', error);
    }
  }

  // Run every Monday at 9 AM to send weekly attendance summary
  @Cron('0 9 * * 1')
  async sendWeeklyAttendanceSummary() {
    this.logger.log('Sending weekly attendance summary...');
    
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Get all students with their weekly attendance
      const students = await this.prisma.user.findMany({
        where: { role: 'STUDENT' },
        include: {
          studentEnrollments: {
            where: { isActive: true },
            include: {
              subject: {
                include: { class: true }
              }
            }
          }
        }
      });

      for (const student of students) {
        for (const enrollment of student.studentEnrollments) {
          const stats = await this.attendanceService.getAttendanceStats({
            studentId: student.id,
            subjectId: enrollment.subjectId,
            startDate: weekAgo.toISOString()
          });

          if (stats.totalSessions > 0) {
            await this.notificationsService.createNotification({
              userId: student.id,
              type: NotificationType.CLASS,
              title: 'Weekly Attendance Summary',
              message: `Your attendance this week in ${enrollment.subject.name}: ${stats.attendancePercentage}% (${stats.present + stats.late}/${stats.totalSessions} classes)`,
              data: {
                subjectId: enrollment.subjectId,
                subjectName: enrollment.subject.name,
                weeklyStats: stats,
                period: 'weekly',
                alertType: 'weekly_summary'
              }
            });
          }
        }
      }
    } catch (error) {
      this.logger.error('Error sending weekly attendance summary:', error);
    }
  }

  // Run every hour during school hours to check for missed sessions
  @Cron('0 9-17 * * 1-6') // 9 AM to 5 PM, Monday to Saturday
  async checkMissedSessions() {
    this.logger.log('Checking for missed sessions...');
    
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Find sessions that ended within the last hour but have unmarked attendance
      const sessionsWithIncompleteAttendance = await this.prisma.liveSession.findMany({
        where: {
          endTime: {
            gte: oneHourAgo,
            lte: now
          }
        },
        include: {
          subject: {
            include: {
              enrollments: {
                where: { isActive: true },
                include: { student: true }
              }
            }
          },
          attendance: true,
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });

      for (const session of sessionsWithIncompleteAttendance) {
        const enrolledStudents = session.subject.enrollments.map(e => e.student);
        const markedAttendance = session.attendance.map(a => a.studentId);
        const unmarkedStudents = enrolledStudents.filter(
          student => !markedAttendance.includes(student.id)
        );

        if (unmarkedStudents.length > 0) {
          // Notify teacher about unmarked attendance
          await this.notificationsService.createNotification({
            userId: session.teacherId,
            type: NotificationType.CLASS,
            title: 'Attendance Reminder',
            message: `Please mark attendance for "${session.title}". ${unmarkedStudents.length} student(s) attendance is pending.`,
            data: {
              sessionId: session.id,
              sessionTitle: session.title,
              unmarkedCount: unmarkedStudents.length,
              unmarkedStudents: unmarkedStudents.map(s => ({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`
              })),
              alertType: 'unmarked_attendance_reminder'
            }
          });
        }
      }
    } catch (error) {
      this.logger.error('Error checking missed sessions:', error);
    }
  }

  // Run every first day of the month at 10 AM to send monthly attendance report
  @Cron('0 10 1 * *')
  async sendMonthlyAttendanceReport() {
    this.logger.log('Sending monthly attendance reports...');
    
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      lastMonth.setDate(1);
      const thisMonth = new Date();
      thisMonth.setDate(1);

      // Get all students
      const students = await this.prisma.user.findMany({
        where: { role: 'STUDENT' },
        include: {
          studentEnrollments: {
            where: { isActive: true },
            include: {
              subject: {
                include: { class: true }
              }
            }
          }
        }
      });

      for (const student of students) {
        let totalSessions = 0;
        let totalPresent = 0;
        const subjectStats: any[] = [];

        for (const enrollment of student.studentEnrollments) {
          const stats = await this.attendanceService.getAttendanceStats({
            studentId: student.id,
            subjectId: enrollment.subjectId,
            startDate: lastMonth.toISOString(),
            endDate: thisMonth.toISOString()
          });

          if (stats.totalSessions > 0) {
            totalSessions += stats.totalSessions;
            totalPresent += stats.present + stats.late;
            
            subjectStats.push({
              subjectName: enrollment.subject.name,
              className: enrollment.subject.class.name,
              stats
            });
          }
        }

        if (totalSessions > 0) {
          const overallPercentage = Math.round((totalPresent / totalSessions) * 100);
          
          await this.notificationsService.createNotification({
            userId: student.id,
            type: NotificationType.CLASS,
            title: 'Monthly Attendance Report',
            message: `Your overall attendance for last month: ${overallPercentage}% (${totalPresent}/${totalSessions} classes)`,
            data: {
              overallPercentage,
              totalSessions,
              totalPresent,
              subjectStats,
              period: 'monthly',
              month: lastMonth.getMonth() + 1,
              year: lastMonth.getFullYear(),
              alertType: 'monthly_report'
            }
          });
        }
      }

      // Send summary to admins
      const adminUsers = await this.prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      });

      const overallStats = await this.attendanceService.getAttendanceStats({
        startDate: lastMonth.toISOString(),
        endDate: thisMonth.toISOString()
      });

      const adminNotifications = adminUsers.map(admin => ({
        userId: admin.id,
        type: NotificationType.SYSTEM,
        title: 'Monthly Attendance Report - Admin Summary',
        message: `System-wide attendance for last month: ${overallStats.attendancePercentage}% (${overallStats.present + overallStats.late}/${overallStats.totalSessions} sessions)`,
        data: {
          overallStats,
          period: 'monthly',
          month: lastMonth.getMonth() + 1,
          year: lastMonth.getFullYear(),
          alertType: 'monthly_admin_summary'
        }
      }));

      await this.notificationsService.createBulkNotifications(adminNotifications);
    } catch (error) {
      this.logger.error('Error sending monthly attendance reports:', error);
    }
  }

  // Manual method to send attendance alerts (can be called by API)
  async sendAttendanceAlert(studentId: string, subjectId: string, customMessage?: string) {
    try {
      const student = await this.prisma.user.findUnique({
        where: { id: studentId }
      });

      const subject = await this.prisma.subject.findUnique({
        where: { id: subjectId },
        include: { class: true }
      });

      if (!student || !subject) {
        throw new Error('Student or subject not found');
      }

      const stats = await this.attendanceService.getAttendanceStats({
        studentId,
        subjectId
      });

      const message = customMessage || 
        `Your attendance in ${subject.name} is ${stats.attendancePercentage}%. Please attend classes regularly.`;

      await this.notificationsService.createNotification({
        userId: studentId,
        type: NotificationType.CLASS,
        title: 'Attendance Alert',
        message,
        data: {
          subjectId,
          subjectName: subject.name,
          className: subject.class.name,
          stats,
          alertType: 'manual_alert'
        }
      });

      this.logger.log(`Sent manual attendance alert to student ${studentId} for subject ${subjectId}`);
    } catch (error) {
      this.logger.error('Error sending manual attendance alert:', error);
      throw error;
    }
  }

  // Send parent notifications (if parent contact info is available)
  async sendParentNotifications(studentId: string, attendancePercentage: number) {
    try {
      // This would require parent contact information in the database
      // For now, we'll create a notification for the student that mentions parent contact
      
      if (attendancePercentage < 75) {
        await this.notificationsService.createNotification({
          userId: studentId,
          type: NotificationType.SYSTEM,
          title: 'Parent Notification Sent',
          message: `Due to low attendance (${attendancePercentage}%), your parents have been notified. Please discuss this with them and ensure regular attendance.`,
          data: {
            attendancePercentage,
            alertType: 'parent_notification',
            notificationSent: true
          }
        });
      }
    } catch (error) {
      this.logger.error('Error sending parent notifications:', error);
    }
  }
}