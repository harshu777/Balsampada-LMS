import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceSchedulerService } from './attendance-scheduler.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MarkAttendanceDto, BulkMarkAttendanceDto } from './dto/mark-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AttendanceQueryDto, AttendanceStatsQueryDto } from './dto/attendance-query.dto';
import { Role } from '@prisma/client';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly attendanceSchedulerService: AttendanceSchedulerService
  ) {}

  @Post('mark')
  @Roles(Role.TEACHER, Role.ADMIN)
  async markAttendance(
    @Body() markAttendanceDto: MarkAttendanceDto,
    @Request() req: any
  ) {
    try {
      const attendance = await this.attendanceService.markAttendance(
        markAttendanceDto,
        req.user.userId
      );
      return {
        status: 'success',
        message: 'Attendance marked successfully',
        data: attendance
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('bulk-mark')
  @Roles(Role.TEACHER, Role.ADMIN)
  async bulkMarkAttendance(
    @Body() bulkMarkAttendanceDto: BulkMarkAttendanceDto,
    @Request() req: any
  ) {
    try {
      const results = await this.attendanceService.bulkMarkAttendance(
        bulkMarkAttendanceDto,
        req.user.userId
      );
      return {
        status: 'success',
        message: 'Bulk attendance marked successfully',
        data: results
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  async updateAttendance(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto
  ) {
    try {
      const attendance = await this.attendanceService.updateAttendance(
        id,
        updateAttendanceDto
      );
      return {
        status: 'success',
        message: 'Attendance updated successfully',
        data: attendance
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @Roles(Role.TEACHER, Role.ADMIN)
  async getAttendance(@Query() query: AttendanceQueryDto) {
    try {
      const result = await this.attendanceService.getAttendance(query);
      return {
        status: 'success',
        message: 'Attendance records retrieved successfully',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('stats')
  async getAttendanceStats(
    @Query() query: AttendanceStatsQueryDto,
    @Request() req: any
  ) {
    try {
      // If student, only allow their own stats
      if (req.user.role === Role.STUDENT) {
        query.studentId = req.user.userId;
      }

      const stats = await this.attendanceService.getAttendanceStats(query);
      return {
        status: 'success',
        message: 'Attendance statistics retrieved successfully',
        data: stats
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('student/:studentId/report')
  @Roles(Role.TEACHER, Role.ADMIN, Role.STUDENT)
  async getStudentAttendanceReport(
    @Param('studentId') studentId: string,
    @Request() req: any,
    @Query('subjectId') subjectId?: string
  ) {
    try {
      // Students can only access their own report
      if (req.user.role === Role.STUDENT && req.user.userId !== studentId) {
        throw new HttpException(
          {
            status: 'error',
            message: 'Access denied'
          },
          HttpStatus.FORBIDDEN
        );
      }

      const report = await this.attendanceService.getStudentAttendanceReport(
        studentId,
        subjectId
      );
      return {
        status: 'success',
        message: 'Student attendance report retrieved successfully',
        data: report
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message
        },
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('session/:sessionId')
  @Roles(Role.TEACHER, Role.ADMIN)
  async getSessionAttendance(@Param('sessionId') sessionId: string) {
    try {
      const attendance = await this.attendanceService.getSessionAttendance(sessionId);
      return {
        status: 'success',
        message: 'Session attendance retrieved successfully',
        data: attendance
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('alerts')
  @Roles(Role.ADMIN, Role.TEACHER)
  async getAttendanceAlerts() {
    try {
      const alerts = await this.attendanceService.getAttendanceAlerts();
      return {
        status: 'success',
        message: 'Attendance alerts retrieved successfully',
        data: alerts
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('my-attendance')
  @Roles(Role.STUDENT)
  async getMyAttendance(
    @Query() query: AttendanceQueryDto,
    @Request() req: any
  ) {
    try {
      // Force studentId to current user for students
      query.studentId = req.user.userId;
      
      const result = await this.attendanceService.getAttendance(query);
      return {
        status: 'success',
        message: 'Your attendance records retrieved successfully',
        data: result
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteAttendance(@Param('id') id: string) {
    try {
      await this.attendanceService.deleteAttendance(id);
      return {
        status: 'success',
        message: 'Attendance record deleted successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('send-alert')
  @Roles(Role.ADMIN, Role.TEACHER)
  async sendAttendanceAlert(
    @Body() body: { studentId: string; subjectId: string; message?: string }
  ) {
    try {
      await this.attendanceSchedulerService.sendAttendanceAlert(
        body.studentId,
        body.subjectId,
        body.message
      );
      return {
        status: 'success',
        message: 'Attendance alert sent successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('trigger-daily-check')
  @Roles(Role.ADMIN)
  async triggerDailyAttendanceCheck() {
    try {
      await this.attendanceSchedulerService.checkLowAttendanceDaily();
      return {
        status: 'success',
        message: 'Daily attendance check triggered successfully'
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: error.message
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}