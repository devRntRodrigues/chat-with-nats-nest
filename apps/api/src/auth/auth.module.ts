import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from '@/models/User';
import { AuthController } from './auth.controller';
import { AuthService } from '@/auth/auth.service';
import { LocalStrategy, JwtStrategy } from '@/config/passport';
import { EnvConfig } from '@/config/env';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvConfig, true>) =>
        ({
          secret: configService.get('jwt.secret', { infer: true }),
          signOptions: {
            expiresIn: configService.get('jwt.expiresIn', { infer: true }),
          },
        }) as JwtModuleOptions,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
