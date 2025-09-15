import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete,
  Param, 
  Query, 
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Body
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    
    const result = await this.notificationsService.getNotificationsByUser(
      req.user.id,
      pageNum,
      limitNum
    );
    
    return result;
  }

  @Get('unread')
  async getUnreadNotifications(@Request() req: any) {
    const notifications = await this.notificationsService.getUnreadNotifications(req.user.id);
    return { notifications };
  }

  @Get('unread/count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllAsRead(@Request() req: any) {
    await this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.notificationsService.deleteNotification(id, req.user.id);
  }

  @Post('clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearNotifications(@Request() req: any) {
    // Clear all read notifications for the user
    await this.notificationsService.deleteOldNotifications(0);
  }
}