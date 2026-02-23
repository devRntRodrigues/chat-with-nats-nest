import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString, IsDate, IsNotEmpty } from 'class-validator';
import { Types, HydratedDocument } from 'mongoose';
import { baseSchemaOptionsWithTimestamps } from '@/common/schema/schema-options';
import { BaseSchemaWithTimestamps } from '@/common/schema/base-schema';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema(baseSchemaOptionsWithTimestamps)
export class Conversation extends BaseSchemaWithTimestamps {
  @Prop()
  participants: Types.ObjectId[];

  @Prop()
  @IsOptional()
  @IsString()
  lastMessage?: Types.ObjectId;

  @Prop()
  @IsOptional()
  @IsString()
  lastMessagePreview?: string;

  @Prop()
  @IsOptional()
  @IsDate()
  @IsNotEmpty()
  lastMessageAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index(
  { 'participants.0': 1, 'participants.1': 1 },
  { unique: true },
);

ConversationSchema.pre(
  'save',
  function (this: ConversationDocument, next: (err?: Error) => void) {
    if (this.isModified('participants')) {
      this.participants.sort((a, b) =>
        a.toString().localeCompare(b.toString()),
      );
    }
    next();
  },
);
