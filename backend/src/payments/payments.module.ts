import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/payment-proofs',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `payment-proof-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = /\.(jpg|jpeg|png|pdf)$/i;
        if (allowedTypes.test(extname(file.originalname))) {
          cb(null, true);
        } else {
          cb(new Error('Only image files (jpg, jpeg, png) and PDF files are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}