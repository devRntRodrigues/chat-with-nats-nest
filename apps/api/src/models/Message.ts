import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
})
export class Message {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required'],
    index: true,
  })
  from: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required'],
    index: true,
  })
  to: Types.ObjectId;

  @Prop({
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [5000, 'Message must not exceed 5000 characters'],
  })
  content: string;

  @Prop({
    default: false,
    index: true,
  })
  read: boolean;

  @Prop({
    default: null,
  })
  readAt?: Date;

  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ from: 1, to: 1, createdAt: -1 });
MessageSchema.index({ from: 1, to: 1, read: 1 });
MessageSchema.index({ createdAt: -1 });
