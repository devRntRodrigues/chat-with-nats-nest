import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from '@/common/decorators/user.decorator';
import type { AuthUser } from '@/config/passport';
import { PresenceService } from '@/services/presence.service';

@Controller('presence')
@UseGuards(JwtAuthGuard)
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Post('heartbeat')
  async heartbeat(@User() user: AuthUser) {
    await this.presenceService.handleHeartbeat(user.id);
    return { success: true };
  }

  @Get('online')
  async getOnlineUsers() {
    const userIds = this.presenceService.getOnlineUsers();
    return { userIds };
  }
}
