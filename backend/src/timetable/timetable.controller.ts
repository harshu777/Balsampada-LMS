import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { CreateTimetableDto, UpdateTimetableDto } from './dto/timetable.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('timetable')
@Controller('timetable')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post()
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Create timetable entry' })
  create(@Body() createTimetableDto: CreateTimetableDto, @Req() req) {
    return this.timetableService.create(createTimetableDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all timetable entries' })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?,
  ) {
    return this.timetableService.findAll(
      req.user.id,
      req.user.role,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('week')
  @ApiOperation({ summary: 'Get timetable for current week' })
  findByWeek(@Query('date') date?: string, @Req() req?) {
    return this.timetableService.findByWeek(
      req.user.id,
      req.user.role,
      date ? new Date(date) : new Date(),
    );
  }

  @Get('day')
  @ApiOperation({ summary: 'Get timetable for specific day' })
  findByDay(@Query('date') date?: string, @Req() req?) {
    return this.timetableService.findByDay(
      req.user.id,
      req.user.role,
      date ? new Date(date) : new Date(),
    );
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming sessions' })
  getUpcoming(@Query('limit') limit?: string, @Req() req?) {
    return this.timetableService.getUpcomingSessions(
      req.user.id,
      req.user.role,
      limit ? parseInt(limit) : 5,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get timetable entry by ID' })
  findOne(@Param('id') id: string) {
    return this.timetableService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Update timetable entry' })
  update(
    @Param('id') id: string,
    @Body() updateTimetableDto: UpdateTimetableDto,
    @Req() req,
  ) {
    return this.timetableService.update(id, updateTimetableDto, req.user.id);
  }

  @Delete(':id')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Delete timetable entry' })
  remove(@Param('id') id: string, @Req() req) {
    return this.timetableService.remove(id, req.user.id);
  }
}