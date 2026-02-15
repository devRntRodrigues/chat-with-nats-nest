import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as PassportLocalStrategy } from 'passport-local';
import { Strategy as PassportJwtStrategy, ExtractJwt } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '@/models/User';
import { EnvConfig } from './app-config';

type User = UserDocument & {
  comparePassword: (password: string) => Promise<boolean>;
};

export type JwtPayload = { userId: string };

export interface AuthUser {
  id: string;
  username: string;
  name: string;
}

@Injectable()
export class LocalStrategy extends PassportStrategy(PassportLocalStrategy) {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<AuthUser> {
    const normalizedUsername = username.trim().toLowerCase();

    const user = await this.userModel
      .findOne({ username: normalizedUsername })
      .select<User>('+passwordHash');

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
    };
  }
}

// JWT Strategy para NestJS
@Injectable()
export class JwtStrategy extends PassportStrategy(PassportJwtStrategy) {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    configService: ConfigService<EnvConfig, true>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt.secret', { infer: true }),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.userModel
      .findById(payload.userId)
      .select<User>('_id username name');

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
    };
  }
}
