import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { registerDecorator, ValidationOptions } from 'class-validator';
import mongoose from 'mongoose';

export function IsObjectId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isObjectId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return (
            typeof value === 'string' && mongoose.Types.ObjectId.isValid(value)
          );
        },
        defaultMessage() {
          return 'Invalid ObjectId format';
        },
      },
    });
  };
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 30;

  @IsOptional()
  @IsString()
  @IsObjectId()
  cursor?: string;
}
