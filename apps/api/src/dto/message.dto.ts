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
import { IsObjectId } from './common.dto';

export class SendMessageDto {
  @IsString()
  @IsObjectId()
  to: string;

  @IsString()
  @MinLength(1, { message: 'Message content is required' })
  @MaxLength(5000, { message: 'Message must not exceed 5000 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  content: string;
}

export class MarkReadDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one message ID is required' })
  @IsString({ each: true })
  @IsObjectId({ each: true })
  @Transform(({ value }: { value: string[] }) => Array.from(new Set(value)))
  messageIds: string[];
}

export class GetMessagesParamsDto {
  @IsString()
  @IsObjectId()
  userId: string;
}

export class GetMessagesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;
}

export class GetConversationsQueryDto {
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
