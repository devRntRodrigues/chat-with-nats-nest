import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, type UserDocument } from '../user.schema';

interface FindUserByExternalIdHandlerCommand {
  externalId: string;
}

@Injectable()
export class FindUserByExternalIdHandler implements ICommandHandler<
  FindUserByExternalIdHandlerCommand,
  User | null
> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  @OtelSpan(FindUserByExternalIdHandler.name, { args: [true] })
  async execute(command: FindUserByExternalIdHandlerCommand) {
    const { externalId } = command;

    return await this.userModel.findOne({ externalId });
  }
}
