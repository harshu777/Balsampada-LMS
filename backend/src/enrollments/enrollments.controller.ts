import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, PaymentStatus } from '@prisma/client';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@ApiTags('enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new enrollment' })
  @ApiResponse({ status: 201, description: 'Enrollment has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Student or subject not found.' })
  @ApiResponse({ status: 409, description: 'Student is already enrolled in this subject.' })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all enrollments' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'subjectId', required: false, type: String, description: 'Filter by subject ID' })
  @ApiQuery({ name: 'studentId', required: false, type: String, description: 'Filter by student ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus, description: 'Filter by payment status' })
  @ApiResponse({ status: 200, description: 'Return all enrollments.' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('subjectId') subjectId?: string,
    @Query('studentId') studentId?: string,
    @Query('isActive') isActive?: boolean,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
  ) {
    return this.enrollmentsService.findAll(page, limit, search, subjectId, studentId, isActive, paymentStatus);
  }

  @Get('my-enrollments')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get enrollments for current student' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Return student enrollments.' })
  findMyEnrollments(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.enrollmentsService.findByStudent(req.user.id, page, limit, isActive);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get enrollment statistics' })
  @ApiResponse({ status: 200, description: 'Return enrollment statistics.' })
  getStats() {
    return this.enrollmentsService.getEnrollmentStats();
  }

  @Get('subject/:subjectId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get enrollments for a specific subject' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Return subject enrollments.' })
  findBySubject(
    @Param('subjectId') subjectId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.enrollmentsService.findBySubject(subjectId, page, limit, isActive);
  }

  @Get('student/:studentId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get enrollments for a specific student' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Return student enrollments.' })
  findByStudent(
    @Param('studentId') studentId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.enrollmentsService.findByStudent(studentId, page, limit, isActive);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get an enrollment by ID' })
  @ApiResponse({ status: 200, description: 'Return the enrollment.' })
  @ApiResponse({ status: 404, description: 'Enrollment not found.' })
  findOne(@Param('id') id: string) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update enrollment status' })
  @ApiResponse({ status: 200, description: 'Enrollment status has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Enrollment not found.' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean; paymentStatus?: PaymentStatus },
  ) {
    return this.enrollmentsService.updateStatus(id, body.isActive, body.paymentStatus);
  }

  @Patch('bulk-update')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Bulk update enrollment status' })
  @ApiResponse({ status: 200, description: 'Enrollments have been successfully updated.' })
  bulkUpdateStatus(
    @Body() body: { 
      enrollmentIds: string[]; 
      isActive: boolean; 
      paymentStatus?: PaymentStatus 
    },
  ) {
    return this.enrollmentsService.bulkUpdateStatus(
      body.enrollmentIds, 
      body.isActive, 
      body.paymentStatus
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an enrollment' })
  @ApiResponse({ status: 200, description: 'Enrollment has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Enrollment not found.' })
  @ApiResponse({ status: 409, description: 'Cannot delete enrollment with payment records.' })
  remove(@Param('id') id: string) {
    return this.enrollmentsService.remove(id);
  }
}