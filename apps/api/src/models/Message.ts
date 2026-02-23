import { BaseSchemaWithTimestamps } from '@/common/schema/base-schema';
import { baseSchemaOptionsWithTimestamps } from '@/common/schema/schema-options';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsBoolean, IsNotEmpty, IsDate, IsOptional } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema(baseSchemaOptionsWithTimestamps)
export class Message extends BaseSchemaWithTimestamps {
  @Prop()
  @IsNotEmpty()
  from: Types.ObjectId;

  @Prop()
  @IsNotEmpty()
  to: Types.ObjectId;

  @Prop()
  @IsNotEmpty()
  content: string;

  @Prop()
  @IsBoolean()
  read: boolean;

  @Prop()
  @IsOptional()
  @IsDate()
  readAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ from: 1, to: 1, createdAt: -1 });
MessageSchema.index({ from: 1, to: 1, read: 1 });
MessageSchema.index({ createdAt: -1 });
