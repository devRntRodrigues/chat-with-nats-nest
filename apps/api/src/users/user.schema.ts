import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Roles } from '@/iam/authorization/roles.constants';
import { BaseSchemaWithTimestamps } from '../common/schema/base-schema';
import { Exclude } from 'class-transformer';
import { baseSchemaOptionsWithTimestamps } from '../common/schema/schema-options';
import { HydratedDocument } from 'mongoose';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export type UserDocument = HydratedDocument<User>;

@Schema(baseSchemaOptionsWithTimestamps)
export class User extends BaseSchemaWithTimestamps {
  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.PENDING,
    required: true,
  })
  status: UserStatus;

  @Prop()
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  @Exclude()
  password: string;

  @Prop({
    type: [String],
    enum: Roles,
    default: [Roles.SUPPORT],
  })
  roles: Roles[];

  @Prop()
  externalId: string;

  @Prop({ default: false })
  isDev: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ name: 'text' });
UserSchema.index({ email: 1 });
UserSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 3600,
    partialFilterExpression: { status: { $eq: UserStatus.PENDING } },
  },
);
