import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { User, UserSchema } from '@/models/User';
import { UsersController } from './users.controller';
import { UserService } from '@/services/user.service';
import { JwtStrategy } from '@/config/passport';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [UsersController],
  providers: [UserService, JwtStrategy],
  exports: [UserService],
})
export class UsersModule {}
