import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObjectId } from './common.dto';

export class ListUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Search query for username or name',
    minLength: 1,
    maxLength: 50,
    example: 'john',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @Transform(({ value }: { value: string }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: 'Number of users to return',
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
