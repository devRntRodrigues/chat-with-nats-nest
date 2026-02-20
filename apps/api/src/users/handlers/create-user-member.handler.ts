import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { OtelMethodCounter } from '@/common/otel/metrics/method-counter.decorator';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user.schema';
import { CreateUserMemberDto } from '@/users/dto/create-user-member.dto';

export interface CreateUserMemberHandlerCommand extends CreateUserMemberDto {}

type CreateUserMemberHandlerOutput = {
  _id: string;
};

@Injectable()
export class CreateUserMemberHandler implements ICommandHandler<
  CreateUserMemberHandlerCommand,
  CreateUserMemberHandlerOutput
> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  @OtelMethodCounter()
  @OtelSpan(CreateUserMemberHandler.name, { args: [true] })
  async execute(command: CreateUserMemberHandlerCommand) {
    const { phone, externalId } = command;

    const user = await this.userModel.findOneAndUpdate(
      {
        phone,
      },
      {
        phone,
        externalId,
      },
      {
        upsert: true,
        new: true,
      },
    );

    return {
      _id: user._id.toString(),
    };
  }
}
