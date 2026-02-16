import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from '@/users/user.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from '@/common/decorators/user.decorator';
import type { AuthUser } from '@/config/passport';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getCurrentUser(@User() user: AuthUser) {
    const result = await this.userService.getCurrentUserById(user.id);
    return { user: result };
  }

  @Get()
  async getAllUsers(@User() user: AuthUser) {
    const users = await this.userService.getAllUsersExcept(user.id);
    return { users };
  }
}
