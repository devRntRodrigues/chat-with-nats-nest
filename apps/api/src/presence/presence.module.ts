import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { User, UserSchema } from '@/users/user.schema';
import { PresenceController } from './presence.controller';
import { PresenceService } from '@/presence/presence.service';
import { JwtStrategy } from '@/config/passport';
import { BrokerModule } from '@/broker/broker.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    BrokerModule,
  ],
  controllers: [PresenceController],
  providers: [PresenceService, JwtStrategy],
  exports: [PresenceService],
})
export class PresenceModule {}
