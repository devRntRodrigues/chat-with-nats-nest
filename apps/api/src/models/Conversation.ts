import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({
  timestamps: true,
})
export class Conversation {
  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'User',
    required: true,
    validate: {
      validator: function (v: Types.ObjectId[]) {
        return v.length === 2;
      },
      message: 'A conversation must have exactly 2 participants',
    },
  })
  participants: Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Message',
    default: null,
  })
  lastMessage?: Types.ObjectId;

  @Prop({
    default: '',
    maxlength: 100,
  })
  lastMessagePreview?: string;

  @Prop({
    default: Date.now,
    index: true,
  })
  lastMessageAt: Date;

  createdAt: Date;
  updatedAt: Date;
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
