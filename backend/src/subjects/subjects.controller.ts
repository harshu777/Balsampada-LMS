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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@ApiTags('subjects')
@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: 201, description: 'Subject has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Class not found.' })
  @ApiResponse({ status: 409, description: 'A subject with this name already exists in this class.' })
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get all subjects' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'classId', required: false, type: String, description: 'Filter by class ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Return all subjects.' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('classId') classId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.subjectsService.findAll(page, limit, search, classId, isActive);
  }

  @Get('my-subjects')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get subjects assigned to current teacher' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: 200, description: 'Return teacher subjects.' })
  findMySubjects(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.subjectsService.findByTeacher(req.user.id, page, limit);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Get a subject by ID' })
  @ApiResponse({ status: 200, description: 'Return the subject.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Get(':id/stats')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get subject statistics' })
  @ApiResponse({ status: 200, description: 'Return subject statistics.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  getStats(@Param('id') id: string) {
    return this.subjectsService.getSubjectStats(id);
  }

  @Post(':id/assign-teacher/:teacherId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign a teacher to a subject' })
  @ApiResponse({ status: 201, description: 'Teacher has been successfully assigned.' })
  @ApiResponse({ status: 400, description: 'Subject or teacher not found.' })
  @ApiResponse({ status: 409, description: 'Teacher is already assigned to this subject.' })
  assignTeacher(@Param('id') id: string, @Param('teacherId') teacherId: string) {
    return this.subjectsService.assignTeacher(id, teacherId);
  }

  @Delete(':id/unassign-teacher/:teacherId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Unassign a teacher from a subject' })
  @ApiResponse({ status: 200, description: 'Teacher has been successfully unassigned.' })
  @ApiResponse({ status: 404, description: 'Teacher assignment not found.' })
  unassignTeacher(@Param('id') id: string, @Param('teacherId') teacherId: string) {
    return this.subjectsService.unassignTeacher(id, teacherId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a subject' })
  @ApiResponse({ status: 200, description: 'Subject has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  @ApiResponse({ status: 409, description: 'A subject with this name already exists in this class.' })
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a subject' })
  @ApiResponse({ status: 200, description: 'Subject has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  @ApiResponse({ status: 409, description: 'Cannot delete subject with active enrollments.' })
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}