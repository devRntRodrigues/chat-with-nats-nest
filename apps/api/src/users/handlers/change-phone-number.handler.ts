import { AppErrors } from '@/app.errors';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChangePhoneNumberDto } from '../dto/change-phone-number.dto';
import { User, UserDocument } from '../user.schema';

export interface ChangePhoneNumberCommand {
  externalUserId: string;
  changePhoneNumberDto: ChangePhoneNumberDto;
}

interface ChangePhoneNumberOutput {
  result: boolean;
}

@Injectable()
export class ChangePhoneNumberHandler implements ICommandHandler<
  ChangePhoneNumberCommand,
  ChangePhoneNumberOutput
> {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  @OtelSpan(ChangePhoneNumberHandler.name)
  async execute(command: ChangePhoneNumberCommand) {
    const { externalUserId, changePhoneNumberDto } = command;

    const user = await this.userModel.findOneAndUpdate(
      {
        externalId: externalUserId,
      },
      {
        phone: changePhoneNumberDto.phone,
      },
    );

    if (!user) {
      throw AppErrors.userNotFound({ externalUserId });
    }

    return { result: true };
  }
}
