import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceSchedulerService } from './attendance-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceSchedulerService],
  exports: [AttendanceService, AttendanceSchedulerService],
})
export class AttendanceModule {}