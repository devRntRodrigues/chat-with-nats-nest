import { AppErrors } from '@/app.errors';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../client.schema';
import { generateClientSecret } from '../oauth.utils';

export interface RefreshClientSecretCommand {
  clientId: string;
}

export interface RefreshClientSecretHandlerOutput extends ClientDocument {}

@Injectable()
export class RefreshClientSecretHandler implements ICommandHandler<
  RefreshClientSecretCommand,
  RefreshClientSecretHandlerOutput
> {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  @OtelSpan(RefreshClientSecretHandler.name, { args: [true] })
  async execute(
    command: RefreshClientSecretCommand,
  ): Promise<RefreshClientSecretHandlerOutput> {
    const { clientId } = command;

    const newSecret = generateClientSecret();

    const updatedClient = await this.clientModel.findByIdAndUpdate(
      clientId,
      {
        secret: newSecret,
      },
      {
        new: true,
        projection: {
          privateKey: 0,
        },
      },
    );

    if (!updatedClient) {
      throw AppErrors.clientNotFound({ id: clientId });
    }

    return updatedClient;
  }
}
