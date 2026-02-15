import {
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObjectId } from './common.dto';

export class SendMessageDto {
  @ApiProperty({
    description: 'Recipient user ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsObjectId()
  to: string;

  @ApiProperty({
    description: 'Message content',
    minLength: 1,
    maxLength: 5000,
    example: 'Hello, how are you?',
  })
  @IsString()
  @MinLength(1, { message: 'Message content is required' })
  @MaxLength(5000, { message: 'Message must not exceed 5000 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  content: string;
}

export class MarkReadDto {
  @ApiProperty({
    description: 'Array of message IDs to mark as read',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one message ID is required' })
  @IsString({ each: true })
  @IsObjectId({ each: true })
  @Transform(({ value }: { value: string[] }) => Array.from(new Set(value)))
  messageIds: string[];
}

export class GetMessagesParamsDto {
  @ApiProperty({
    description: 'User ID to get messages with',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsObjectId()
  userId: string;
}

export class GetMessagesQueryDto {
  @ApiPropertyOptional({
    description: 'Number of messages to return',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Cursor for pagination',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}

export class GetConversationsQueryDto {
  @ApiPropertyOptional({
    description: 'Number of conversations to return',
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
