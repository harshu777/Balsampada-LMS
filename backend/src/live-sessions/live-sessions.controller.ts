import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LiveSessionsService } from './live-sessions.service';
import { CreateLiveSessionDto } from './dto/create-live-session.dto';
import { UpdateLiveSessionDto } from './dto/update-live-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('live-sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LiveSessionsController {
  constructor(private readonly liveSessionsService: LiveSessionsService) {}

  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  create(@Body() createLiveSessionDto: CreateLiveSessionDto, @Req() req: any) {
    return this.liveSessionsService.create(createLiveSessionDto, req.user.id);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.liveSessionsService.findAll(req.user.id, req.user.role);
  }

  @Get('upcoming')
  getUpcoming(@Req() req: any) {
    return this.liveSessionsService.getUpcomingSessions(req.user.id, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.liveSessionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateLiveSessionDto: UpdateLiveSessionDto,
    @Req() req: any,
  ) {
    return this.liveSessionsService.update(id, updateLiveSessionDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.liveSessionsService.remove(id, req.user.id);
  }

  @Post(':id/join')
  joinSession(@Param('id') id: string, @Req() req: any) {
    return this.liveSessionsService.joinSession(id, req.user.id);
  }

  @Post(':id/leave')
  leaveSession(@Param('id') id: string, @Req() req: any) {
    return this.liveSessionsService.leaveSession(id, req.user.id);
  }
}
