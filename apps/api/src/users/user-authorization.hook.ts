import { ExecutionContext, Injectable } from '@nestjs/common';
import { SubjectHook } from '@/iam/authorization/interfaces/subject-hook.interface';
import { Request } from 'express';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BrokerContext } from '../broker/broker-context';

@Injectable()
export class UserAuthorizationHook implements SubjectHook<User> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async run(context: ExecutionContext): Promise<User | null> {
    let params: any;

    if (context.getType() === 'rpc') {
      const ctx = context.switchToRpc().getContext<BrokerContext>();
      params = ctx.getPayload();
    } else {
      const request = context.switchToHttp().getRequest<Request>();
      params = request.params;
    }

    return this.userModel.findById(params.userId);
  }
}
