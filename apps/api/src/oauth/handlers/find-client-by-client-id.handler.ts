import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../client.schema';

export interface FindClientByClientIdCommand {
  clientId: string;
}

export type FindClientByClientIdHandlerOutput = ClientDocument | null;

@Injectable()
export class FindClientByClientIdHandler implements ICommandHandler<
  FindClientByClientIdCommand,
  FindClientByClientIdHandlerOutput
> {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  @OtelSpan(FindClientByClientIdHandler.name, { args: [true] })
  async execute(
    command: FindClientByClientIdCommand,
  ): Promise<FindClientByClientIdHandlerOutput> {
    const { clientId } = command;

    return await this.clientModel.findOne({
      clientId,
    });
  }
}
