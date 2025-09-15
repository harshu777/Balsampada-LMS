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
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { SubmitTestDto, StartTestDto } from './dto/submit-test.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  create(
    @Body() createTestDto: CreateTestDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.testsService.create(createTestDto, user.id);
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
    return this.testsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      subjectId,
      teacherId,
      isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    );
  }

  @Get('my-tests')
  @Roles(Role.STUDENT)
  findMyTests(
    @CurrentUser() user: { id: string; role: Role },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: 'upcoming' | 'ongoing' | 'completed',
  ) {
    return this.testsService.findStudentTests(
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
    @Query('includeAnswers') includeAnswers?: string,
  ) {
    return this.testsService.findOne(
      id, 
      user.id, 
      user.role,
      includeAnswers === 'true'
    );
  }

  @Get(':id/stats')
  @Roles(Role.TEACHER, Role.ADMIN)
  getTestStats(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.testsService.getTestStats(id, user.id, user.role);
  }

  @Get(':id/results')
  @Roles(Role.STUDENT)
  getTestResults(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.testsService.getTestResults(id, user.id);
  }

  @Patch(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateTestDto: UpdateTestDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.testsService.update(id, updateTestDto, user.id, user.role);
  }

  @Delete(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.testsService.remove(id, user.id, user.role);
  }

  @Post('start')
  @Roles(Role.STUDENT)
  startTest(
    @Body() startDto: StartTestDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.testsService.startTest(startDto, user.id);
  }

  @Post('submit')
  @Roles(Role.STUDENT)
  submitTest(
    @Body() submitDto: SubmitTestDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.testsService.submitTest(submitDto, user.id);
  }
}