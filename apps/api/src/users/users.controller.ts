import { OAuthGuard } from '@/oauth/oauth.guard';
import {
  Body,
  Controller,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChangePhoneNumberParamsDto } from './dto/change-phone-number-params.dto';
import { ChangePhoneNumberDto } from './dto/change-phone-number.dto';
import { CreateUserQueryParamsDto } from './dto/create-user-query-params.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePhoneNumberHandler } from './handlers/change-phone-number.handler';
import {
  CreateUserHandler,
  CreateUserHandlerOutput,
} from './handlers/create-user.handler';
import { CreateUserMemberDto } from './dto/create-user-member.dto';
import { CreateUserMemberHandler } from './handlers/create-user-member.handler';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserHandler: CreateUserHandler,
    private readonly changePhoneNumberHandler: ChangePhoneNumberHandler,
    private readonly createUserMemberHandler: CreateUserMemberHandler,
  ) {}

  @Post()
  async createUser(
    @Query() query: CreateUserQueryParamsDto,
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserHandlerOutput> {
    const { token } = query;

    return await this.createUserHandler.execute({
      token,
      createUserData: createUserDto,
    });
  }

  @UseGuards(OAuthGuard)
  @Post('/:userId/change-phone')
  async changePhoneNumber(
    @Param() params: ChangePhoneNumberParamsDto,
    @Body() changePhoneNumberDto: ChangePhoneNumberDto,
  ) {
    const { userId } = params;

    return await this.changePhoneNumberHandler.execute({
      externalUserId: userId,
      changePhoneNumberDto,
    });
  }

  @UseGuards(OAuthGuard)
  @Post('/create-member')
  async createUserMember(@Body() dto: CreateUserMemberDto) {
    return await this.createUserMemberHandler.execute(dto);
  }
}
