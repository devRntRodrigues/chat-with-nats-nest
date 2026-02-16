import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { User } from '@/common/decorators/user.decorator';
import type { AuthUser } from '@/config/passport';
import { RegisterDto } from '@/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.registerUser(
      dto.name,
      dto.username,
      dto.password,
    );
    return result;
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  login(@User() user: AuthUser) {
    return this.authService.login(user);
  }
}
