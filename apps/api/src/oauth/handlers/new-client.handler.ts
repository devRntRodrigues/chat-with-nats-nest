import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../client.schema';
import { generateClientCredentials, generateKeyPair } from '../oauth.utils';
import { CreateClientDto } from '../dto/create-client.dto';
import { OtelMethodCounter } from '@/common/otel/metrics/method-counter.decorator';

export interface NewClientCommand extends CreateClientDto {}

export interface NewClientHandlerOutput extends ClientDocument {}

@Injectable()
export class NewClientHandler implements ICommandHandler<
  NewClientCommand,
  NewClientHandlerOutput
> {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  @OtelMethodCounter()
  @OtelSpan(NewClientHandler.name, { args: [true] })
  async execute(command: NewClientCommand): Promise<NewClientHandlerOutput> {
    const { description, redirectUris } = command;

    const clientCredentials = generateClientCredentials();

    const keyPair = await generateKeyPair('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    const client = await this.clientModel.create({
      clientId: clientCredentials.clientId,
      secret: clientCredentials.clientSecret,
      redirectUris: redirectUris,
      description: description,
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
    });

    return client;
  }
}
