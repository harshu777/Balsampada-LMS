import { Module } from '@nestjs/common';
import { LiveSessionsService } from './live-sessions.service';
import { LiveSessionsController } from './live-sessions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LiveSessionsService],
  controllers: [LiveSessionsController],
  exports: [LiveSessionsService],
})
export class LiveSessionsModule {}
