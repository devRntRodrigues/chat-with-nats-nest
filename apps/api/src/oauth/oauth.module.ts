import { BrokerModule } from '@/broker/broker.module';
import { JwtStrategy } from '@/config/passport';
import { User, UserSchema } from '@/users/user.schema';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AppConfig } from '@/config/app-config';
import { UsersModule } from '../users/users.module';
import { Client, ClientSchema } from './client.schema';
import { DeleteClientHandler } from './handlers/delete-client.handler';
import { FindClientByClientIdHandler } from './handlers/find-client-by-client-id.handler';
import { FindClientByIdHandler } from './handlers/find-client-by-id.handler';
import { GenerateAccessTokensHandler } from './handlers/generate-access-tokens.handler';
import { NewClientHandler } from './handlers/new-client.handler';
import { RefreshClientSecretHandler } from './handlers/refresh-client-secret.handler';
import { SendVerificationCodeHandler } from './handlers/send-verification-code.handler';
import { SignInUserHandler } from './handlers/signin-user.handler';
import { UpdateClientHandler } from './handlers/update-client.handler';
import { OAuthController } from './oauth.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        secret: config.get('jwt.secret', { infer: true }),
        signOptions: {
          expiresIn: config.get('jwt.expiresIn', { infer: true }),
        },
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UsersModule),
    BrokerModule,
  ],
  controllers: [OAuthController],
  providers: [
    JwtStrategy,
    SendVerificationCodeHandler,
    FindClientByIdHandler,
    FindClientByClientIdHandler,
    SignInUserHandler,
    GenerateAccessTokensHandler,
    UpdateClientHandler,
    RefreshClientSecretHandler,
    DeleteClientHandler,
    NewClientHandler,
  ],
  exports: [
    JwtModule,
    PassportModule,
    JwtStrategy,
    SendVerificationCodeHandler,
    FindClientByIdHandler,
    FindClientByClientIdHandler,
  ],
})
export class OAuthModule {}
