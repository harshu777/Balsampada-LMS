import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { DocumentsModule } from './documents/documents.module';
import { PaymentsModule } from './payments/payments.module';
import { WebSocketsModule } from './websockets/websockets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ClassesModule } from './classes/classes.module';
import { SubjectsModule } from './subjects/subjects.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { TestsModule } from './tests/tests.module';
import { AttendanceModule } from './attendance/attendance.module';
import { MaterialsModule } from './materials/materials.module';
import { MessagesModule } from './messages/messages.module';
import { TimetableModule } from './timetable/timetable.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UsersModule } from './users/users.module';
import { LiveSessionsModule } from './live-sessions/live-sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    PrismaModule,
    EmailModule,
    AuthModule,
    DocumentsModule,
    PaymentsModule,
    WebSocketsModule,
    NotificationsModule,
    ClassesModule,
    SubjectsModule,
    EnrollmentsModule,
    AssignmentsModule,
    TestsModule,
    AttendanceModule,
    MaterialsModule,
    MessagesModule,
    TimetableModule,
    AnalyticsModule,
    UsersModule,
    LiveSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
