import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@/users/user.schema';
import { PresenceController } from './presence.controller';
import { PresenceService } from '@/presence/presence.service';
import { OAuthModule } from '@/oauth/oauth.module';
import { BrokerModule } from '@/broker/broker.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    OAuthModule,
    BrokerModule,
  ],
  controllers: [PresenceController],
  providers: [PresenceService],
  exports: [PresenceService],
})
export class PresenceModule {}
