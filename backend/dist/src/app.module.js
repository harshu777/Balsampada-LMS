"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const email_module_1 = require("./email/email.module");
const documents_module_1 = require("./documents/documents.module");
const payments_module_1 = require("./payments/payments.module");
const websockets_module_1 = require("./websockets/websockets.module");
const notifications_module_1 = require("./notifications/notifications.module");
const classes_module_1 = require("./classes/classes.module");
const subjects_module_1 = require("./subjects/subjects.module");
const enrollments_module_1 = require("./enrollments/enrollments.module");
const assignments_module_1 = require("./assignments/assignments.module");
const tests_module_1 = require("./tests/tests.module");
const attendance_module_1 = require("./attendance/attendance.module");
const materials_module_1 = require("./materials/materials.module");
const messages_module_1 = require("./messages/messages.module");
const timetable_module_1 = require("./timetable/timetable.module");
const analytics_module_1 = require("./analytics/analytics.module");
const users_module_1 = require("./users/users.module");
const live_sessions_module_1 = require("./live-sessions/live-sessions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 10,
                }]),
            prisma_module_1.PrismaModule,
            email_module_1.EmailModule,
            auth_module_1.AuthModule,
            documents_module_1.DocumentsModule,
            payments_module_1.PaymentsModule,
            websockets_module_1.WebSocketsModule,
            notifications_module_1.NotificationsModule,
            classes_module_1.ClassesModule,
            subjects_module_1.SubjectsModule,
            enrollments_module_1.EnrollmentsModule,
            assignments_module_1.AssignmentsModule,
            tests_module_1.TestsModule,
            attendance_module_1.AttendanceModule,
            materials_module_1.MaterialsModule,
            messages_module_1.MessagesModule,
            timetable_module_1.TimetableModule,
            analytics_module_1.AnalyticsModule,
            users_module_1.UsersModule,
            live_sessions_module_1.LiveSessionsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map