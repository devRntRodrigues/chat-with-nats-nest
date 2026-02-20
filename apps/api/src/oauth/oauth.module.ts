import { AuthModule } from '@/auth/auth.module';
import { BrokerModule } from '@/broker/broker.module';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
    AuthModule,
    forwardRef(() => UsersModule),
    BrokerModule,
  ],
  controllers: [OAuthController],
  providers: [
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
    SendVerificationCodeHandler,
    FindClientByIdHandler,
    FindClientByClientIdHandler,
  ],
})
export class OAuthModule {}
