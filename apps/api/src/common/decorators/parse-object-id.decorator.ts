import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { createError } from '../errors/create-error';

export function ParseObjectId() {
  return Transform(
    ({ value, key }: { value: string; key: string }) => {
      if (!Types.ObjectId.isValid(value)) {
        throw createError({
          error: BadRequestException,
          code: 'BRQ-002',
          message: `Invalid ObjectId for property "${key}": ${value}`,
          details: {
            [key]: value,
          },
        });
      }
      return new Types.ObjectId(value);
    },
    {
      toClassOnly: true,
    },
  );
}
