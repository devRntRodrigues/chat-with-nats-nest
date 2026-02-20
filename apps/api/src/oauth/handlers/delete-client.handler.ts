import { AppErrors } from '@/app.errors';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../client.schema';

export interface DeleteClientCommand {
  clientId: string;
}

export interface DeleteClientHandlerOutput extends ClientDocument {}

@Injectable()
export class DeleteClientHandler implements ICommandHandler<
  DeleteClientCommand,
  DeleteClientHandlerOutput
> {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  @OtelSpan(DeleteClientHandler.name, { args: [true] })
  async execute(
    command: DeleteClientCommand,
  ): Promise<DeleteClientHandlerOutput> {
    const { clientId } = command;

    const deletedClient = await this.clientModel.findByIdAndDelete(clientId);

    if (!deletedClient) {
      throw AppErrors.clientNotFound({ id: clientId });
    }

    return deletedClient;
  }
}
