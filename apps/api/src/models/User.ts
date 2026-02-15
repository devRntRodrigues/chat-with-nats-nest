import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import bcrypt from '@node-rs/bcrypt';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform(_doc, ret: Record<string, unknown>) {
      const { passwordHash: _passwordHash, __v, ...safe } = ret;
      return safe;
    },
  },
})
export class User {
  @Prop({
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name must not exceed 50 characters'],
  })
  name: string;

  @Prop({
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must not exceed 30 characters'],
    match: [
      /^[a-z0-9_]+$/,
      'Username can only contain lowercase letters, numbers, and underscores',
    ],
  })
  username: string;

  @Prop({
    required: [true, 'Password is required'],
    select: false,
  })
  passwordHash: string;

  @Prop({
    required: false,
  })
  lastSeen?: Date;

  createdAt: Date;
  updatedAt: Date;

  comparePassword: (password: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ username: 1 });
UserSchema.index({ lastSeen: -1 });

UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};
