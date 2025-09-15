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
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto, GradeAssignmentDto } from './dto/submit-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: Role;
  };
}

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseInterceptors(FileInterceptor('attachment', {
    storage: diskStorage({
      destination: './uploads/assignments',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
  }))
  create(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @CurrentUser() user: { id: string; role: Role },
    @UploadedFile() attachment?: Express.Multer.File,
    @Req() req?: AuthenticatedRequest,
  ) {
    if (attachment) {
      createAssignmentDto.attachmentUrl = attachment.path;
    }
    return this.assignmentsService.create(createAssignmentDto, user.id);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('subjectId') subjectId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.assignmentsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      subjectId,
      teacherId,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Get('my-assignments')
  @Roles(Role.STUDENT)
  findMyAssignments(
    @CurrentUser() user: { id: string; role: Role },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: 'pending' | 'submitted' | 'graded',
  ) {
    return this.assignmentsService.findStudentAssignments(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.assignmentsService.findOne(id, user.id, user.role);
  }

  @Get(':id/stats')
  @Roles(Role.TEACHER, Role.ADMIN)
  getAssignmentStats(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.assignmentsService.getAssignmentStats(id, user.id, user.role);
  }

  @Patch(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @UseInterceptors(FileInterceptor('attachment', {
    storage: diskStorage({
      destination: './uploads/assignments',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
  }))
  update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @CurrentUser() user: { id: string; role: Role },
    @UploadedFile() attachment?: Express.Multer.File,
  ) {
    if (attachment) {
      updateAssignmentDto.attachmentUrl = attachment.path;
    }
    return this.assignmentsService.update(id, updateAssignmentDto, user.id, user.role);
  }

  @Delete(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.assignmentsService.remove(id, user.id, user.role);
  }

  @Post('submit')
  @Roles(Role.STUDENT)
  @UseInterceptors(FileInterceptor('submission', {
    storage: diskStorage({
      destination: './uploads/submissions',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit for submissions
    },
  }))
  submitAssignment(
    @Body() submitDto: SubmitAssignmentDto,
    @CurrentUser() user: { id: string; role: Role },
    @UploadedFile() submission?: Express.Multer.File,
  ) {
    const attachmentUrl = submission ? submission.path : undefined;
    return this.assignmentsService.submitAssignment(submitDto, user.id, attachmentUrl);
  }

  @Post('grade')
  @Roles(Role.TEACHER, Role.ADMIN)
  gradeAssignment(
    @Body() gradeDto: GradeAssignmentDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.assignmentsService.gradeAssignment(gradeDto, user.id, user.role);
  }
}