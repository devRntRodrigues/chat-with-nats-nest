import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@/users/user.schema';
import { UserAuthorizationHook } from './user-authorization.hook';
import { UsersController } from './users.controller';
import { UserService } from '@/users/user.service';
import { ChangePhoneNumberHandler } from './handlers/change-phone-number.handler';
import { CreateUserMemberHandler } from './handlers/create-user-member.handler';
import { CreateUserHandler } from './handlers/create-user.handler';
import { FindUserByExternalIdHandler } from './handlers/find-user-by-external-id.handler';
import { FindUserByPhoneHandler } from './handlers/find-user-by-phone.handler';
import { OAuthModule } from '@/oauth/oauth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => OAuthModule),
  ],
  controllers: [UsersController],
  providers: [
    UserService,
    UserAuthorizationHook,
    CreateUserHandler,
    ChangePhoneNumberHandler,
    CreateUserMemberHandler,
    FindUserByPhoneHandler,
    FindUserByExternalIdHandler,
  ],
  exports: [UserService, FindUserByPhoneHandler, FindUserByExternalIdHandler],
})
export class UsersModule {}
