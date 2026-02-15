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
  @ApiPropertyOptional({
    description: 'Number of items to return',
    minimum: 1,
    maximum: 100,
    default: 30,
    example: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 30;

  @ApiPropertyOptional({
    description: 'Cursor for pagination (ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  @IsObjectId()
  cursor?: string;
}
