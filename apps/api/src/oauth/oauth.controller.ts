import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseSerializerInterceptor } from '../common/interceptors/response-serializer.interceptor';
import { AccessTokensDto } from './dto/access-tokens.dto';
import { NewClientHandler } from './handlers/new-client.handler';
import {
  ClientResponseNewClientDto,
  ClientResponseRefreshClientDto,
  ClientResponseUpdateClientDto,
} from './dto/client-response.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { DeleteClientParamsDto } from './dto/delete-client-params.dto';
import { RefreshClientSecretParamsDto } from './dto/refresh-client-secret-params.dto';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateClientParamsDto } from './dto/update-client-params.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { DeleteClientHandler } from './handlers/delete-client.handler';
import { GenerateAccessTokensHandler } from './handlers/generate-access-tokens.handler';
import { RefreshClientSecretHandler } from './handlers/refresh-client-secret.handler';
import { SendVerificationCodeHandler } from './handlers/send-verification-code.handler';
import { SignInUserHandler } from './handlers/signin-user.handler';
import { UpdateClientHandler } from './handlers/update-client.handler';
import { OAuthGuard } from './oauth.guard';

@Controller('oa')
export class OAuthController {
  constructor(
    private readonly sendVerificationCodeHandler: SendVerificationCodeHandler,
    private readonly signInUserHandler: SignInUserHandler,
    private readonly generateAccessTokensHandler: GenerateAccessTokensHandler,
    private readonly updateClientHandler: UpdateClientHandler,
    private readonly refreshClientSecretHandler: RefreshClientSecretHandler,
    private readonly deleteClientHandler: DeleteClientHandler,
    private readonly newClientHandler: NewClientHandler,
  ) {}

  @Get('auth')
  async sendVerificationCode(
    @Query() sendVerificationCodeDto: SendVerificationCodeDto,
  ) {
    return this.sendVerificationCodeHandler.execute(sendVerificationCodeDto);
  }

  @Post('auth')
  async signIn(@Body() signInDto: SignInDto) {
    return await this.signInUserHandler.execute(signInDto);
  }

  @Post('token')
  @HttpCode(200)
  async accessToken(@Body() accessTokensDto: AccessTokensDto) {
    const tokens =
      await this.generateAccessTokensHandler.execute(accessTokensDto);

    return {
      access_token: tokens.token,
      refresh_token: tokens.refreshToken,
      token_type: 'Bearer',
      expires_in: tokens.expiresIn,
      ...(tokens.scope && { scope: tokens.scope }),
    };
  }

  @UseGuards(OAuthGuard)
  @UseInterceptors(ResponseSerializerInterceptor(ClientResponseNewClientDto))
  @Post('clients')
  async createClient(@Body() createClientDto: CreateClientDto) {
    return this.newClientHandler.execute(createClientDto);
  }

  @UseGuards(OAuthGuard)
  @UseInterceptors(ResponseSerializerInterceptor(ClientResponseUpdateClientDto))
  @Patch('clients/:id')
  async updateClient(
    @Param() params: UpdateClientParamsDto,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    const { id } = params;

    return this.updateClientHandler.execute({
      clientId: id,
      updateData: updateClientDto,
    });
  }

  @UseGuards(OAuthGuard)
  @UseInterceptors(
    ResponseSerializerInterceptor(ClientResponseRefreshClientDto),
  )
  @Delete('clients/:id')
  async deleteClient(@Param() params: DeleteClientParamsDto) {
    const { id } = params;

    return this.deleteClientHandler.execute({ clientId: id });
  }

  @UseGuards(OAuthGuard)
  @UseInterceptors(
    ResponseSerializerInterceptor(ClientResponseRefreshClientDto),
  )
  @Post('clients/:id/refresh-client-secret')
  async refreshClientSecret(@Param() params: RefreshClientSecretParamsDto) {
    const { id } = params;

    return this.refreshClientSecretHandler.execute({ clientId: id });
  }
}
