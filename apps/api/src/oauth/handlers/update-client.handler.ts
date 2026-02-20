import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../client.schema';
import { UpdateClientDto } from '../dto/update-client.dto';
import { AppErrors } from '@/app.errors';

export interface UpdateClientCommand {
  clientId: string;
  updateData: UpdateClientDto;
}

export interface UpdateClientHandlerOutput extends ClientDocument {}

@Injectable()
export class UpdateClientHandler implements ICommandHandler<
  UpdateClientCommand,
  UpdateClientHandlerOutput
> {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  @OtelSpan(UpdateClientHandler.name, { args: [true] })
  async execute(
    command: UpdateClientCommand,
  ): Promise<UpdateClientHandlerOutput> {
    const { clientId, updateData } = command;

    const updatedClient = await this.clientModel.findByIdAndUpdate(
      clientId,
      {
        description: updateData.description,
      },
      {
        new: true,
      },
    );

    if (!updatedClient) {
      throw AppErrors.clientNotFound({ id: clientId });
    }

    return updatedClient;
  }
}
