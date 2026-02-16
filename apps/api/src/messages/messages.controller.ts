import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MessageService } from '@/messages/message.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from '@/common/decorators/user.decorator';
import type { AuthUser } from '@/config/passport';
import { GetMessagesQueryDto } from '@/dto/message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messageService: MessageService) {}

  @Get('unread/counts')
  async getUnreadCounts(@User() user: AuthUser) {
    const unreadCounts = await this.messageService.getUnreadCounts(user.id);
    return { unreadCounts };
  }

  @Get('conversations')
  async getConversations(@User() user: AuthUser) {
    const conversations = await this.messageService.getConversationsWithUnread(
      user.id,
    );
    return { conversations };
  }

  @Get(':userId')
  async getMessages(
    @User() user: AuthUser,
    @Param('userId') userId: string,
    @Query() query: GetMessagesQueryDto,
  ) {
    const limit = query.limit ?? 20;
    const { messages, nextCursor } =
      await this.messageService.getMessagesBetweenUsers(
        user.id,
        userId,
        limit,
        query.cursor,
      );
    return {
      data: { messages },
      meta: { nextCursor, limit },
    };
  }
}
