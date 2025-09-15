import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboardStats(@Req() req) {
    return this.analyticsService.getDashboardStats(req.user.id, req.user.role);
  }

  @Get('student-performance/:studentId')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get student performance analytics' })
  getStudentPerformance(
    @Param('studentId') studentId: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.analyticsService.getStudentPerformance(studentId, subjectId);
  }

  @Get('my-performance')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get my performance analytics' })
  getMyPerformance(@Req() req, @Query('subjectId') subjectId?: string) {
    return this.analyticsService.getStudentPerformance(req.user.id, subjectId);
  }

  @Get('class-performance/:classId')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Get class performance analytics' })
  getClassPerformance(@Param('classId') classId: string) {
    return this.analyticsService.getClassPerformance(classId);
  }

  @Get('revenue')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get revenue analytics' })
  getRevenueAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getRevenueAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Get attendance analytics' })
  getAttendanceAnalytics(
    @Query('subjectId') subjectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getAttendanceAnalytics(
      subjectId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('teacher')
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Get teacher analytics' })
  getTeacherAnalytics(@Req() req) {
    return this.analyticsService.getTeacherAnalytics(req.user.id);
  }

  @Get('teacher/:teacherId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get teacher analytics by ID' })
  getTeacherAnalyticsById(@Param('teacherId') teacherId: string) {
    return this.analyticsService.getTeacherAnalytics(teacherId);
  }
}