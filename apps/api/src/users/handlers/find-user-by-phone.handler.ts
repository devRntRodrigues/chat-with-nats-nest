import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user.schema';
import { Model } from 'mongoose';
import { OtelSpan } from '@/common/otel/traces/span.decorator';

interface FindUserByPhoneCommand {
  phone: string;
}

@Injectable()
export class FindUserByPhoneHandler implements ICommandHandler<
  FindUserByPhoneCommand,
  User | null
> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  @OtelSpan(FindUserByPhoneHandler.name, { args: [true] })
  async execute(command: FindUserByPhoneCommand) {
    const { phone } = command;

    return await this.userModel.findOne({ phone });
  }
}
