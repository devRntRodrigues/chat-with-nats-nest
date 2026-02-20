import { SchemaOptions } from '@nestjs/mongoose';

export const baseSchemaOptions: SchemaOptions = {
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
};

export const baseSchemaOptionsWithoutId: SchemaOptions = {
  ...baseSchemaOptions,
  _id: false,
};

export const baseSchemaOptionsWithTimestamps: SchemaOptions = {
  ...baseSchemaOptions,
  timestamps: true,
};
