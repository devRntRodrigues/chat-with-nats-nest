import {
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsObjectId } from '@/common/decorators/is-oject-id.decorator';

export class SendMessageDto {
  @IsString()
  @IsObjectId()
  to: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  @Transform(({ value }: { value: string }) => value?.trim())
  content: string;
}

export class MarkReadDto {
  @IsArray()
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
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;
}

export class GetConversationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 30;

  @IsOptional()
  @IsString()
  @IsObjectId()
  cursor?: string;
}
