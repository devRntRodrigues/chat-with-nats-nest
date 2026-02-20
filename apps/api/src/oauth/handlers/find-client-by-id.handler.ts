import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../client.schema';

export interface FindClientByIdCommand {
  id: string;
}

export type FindClientByIdHandlerOutput = ClientDocument | null;

@Injectable()
export class FindClientByIdHandler implements ICommandHandler<
  FindClientByIdCommand,
  FindClientByIdHandlerOutput
> {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  @OtelSpan(FindClientByIdHandler.name, { args: [true] })
  async execute(
    command: FindClientByIdCommand,
  ): Promise<FindClientByIdHandlerOutput> {
    const { id } = command;

    return this.clientModel.findById(id);
  }
}
