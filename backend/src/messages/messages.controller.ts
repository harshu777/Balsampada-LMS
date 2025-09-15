import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  sendMessage(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    return this.messagesService.sendMessage(createMessageDto, req.user.id);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  getConversations(@Req() req) {
    return this.messagesService.getConversations(req.user.id);
  }

  @Get('chat/:otherUserId')
  @ApiOperation({ summary: 'Get messages with specific user' })
  getMessages(
    @Param('otherUserId') otherUserId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Req() req?,
  ) {
    return this.messagesService.getMessages(
      req.user.id,
      otherUserId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  markAsRead(@Param('id') id: string, @Req() req) {
    return this.messagesService.markAsRead(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  deleteMessage(@Param('id') id: string, @Req() req) {
    return this.messagesService.deleteMessage(id, req.user.id);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread message count' })
  getUnreadCount(@Req() req) {
    return this.messagesService.getUnreadCount(req.user.id);
  }
}