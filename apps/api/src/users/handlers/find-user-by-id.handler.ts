import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { User, UserDocument } from '../user.schema';
import { Injectable } from '@nestjs/common';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface FindUserByIdCommand {
  id: string;
}

@Injectable()
export class FindUserByIdHandler implements ICommandHandler<
  FindUserByIdCommand,
  User | null
> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  @OtelSpan(FindUserByIdHandler.name, { args: [true] })
  async execute(command: FindUserByIdCommand) {
    const { id } = command;

    return this.userModel.findById(id);
  }
}
