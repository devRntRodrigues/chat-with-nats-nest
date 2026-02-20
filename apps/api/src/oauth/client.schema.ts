import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClientDocument = HydratedDocument<Client>;

@Schema()
export class Client {
  @Prop()
  clientId: string;

  @Prop()
  secret: string;

  @Prop()
  description: string;

  @Prop()
  redirectUris: string[];

  @Prop()
  privateKey: string;

  @Prop()
  publicKey: string;

  @Prop()
  roles: string[];

  @Prop()
  isAdmin: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
