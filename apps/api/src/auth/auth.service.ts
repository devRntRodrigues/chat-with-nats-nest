import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../models/User';
import bcrypt from '@node-rs/bcrypt';
import type { AuthUser } from '@/config/passport';
import type { EnvConfig } from '@/config/env';

export interface RegisterUserResult {
  user: {
    id: string;
    name: string;
    username: string;
    createdAt: Date;
  };
  token: string;
  authenticator: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService<EnvConfig, true>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  generateToken(userId: string): string {
    return this.jwtService.sign({ userId });
  }

  getBrokerAuthenticator(): string {
    return this.configService.get('broker.authToken', { infer: true }) || '';
  }

  async registerUser(
    name: string,
    username: string,
    password: string,
  ): Promise<RegisterUserResult> {
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await this.hashPassword(password);

    const user = await this.userModel.create({
      name,
      username,
      passwordHash,
    });

    const token = this.generateToken(user.id);
    const authenticator = this.getBrokerAuthenticator();

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        createdAt: user.createdAt,
      },
      token,
      authenticator,
    };
  }

  login(user: AuthUser): {
    user: AuthUser;
    token: string;
    authenticator: string;
  } {
    const token = this.generateToken(user.id);
    const authenticator = this.getBrokerAuthenticator();
    return { user, token, authenticator };
  }
}
