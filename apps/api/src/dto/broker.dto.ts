import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsObjectId } from './common.dto';

export class TypingEventDto {
  @IsString()
  @IsObjectId()
  fromUserId: string;

  @IsString()
  @IsObjectId()
  toUserId: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  username?: string;
}

export class PresenceConnectDto {
  @IsString()
  @IsObjectId()
  userId: string;

  @IsString()
  @MinLength(1)
  socketId: string;

  @IsString()
  @MinLength(1)
  username: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;
}

export class PresenceDisconnectDto {
  @IsString()
  @IsObjectId()
  userId: string;

  @IsString()
  @MinLength(1)
  socketId: string;

  @IsString()
  @MinLength(1)
  username: string;
}

export class MessageSendBrokerDto {
  @IsString()
  @IsObjectId()
  fromUserId: string;

  @IsString()
  @IsObjectId()
  toUserId: string;

  @IsString()
  @MinLength(1, { message: 'Message content is required' })
  @MaxLength(5000, { message: 'Message must not exceed 5000 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  content: string;

  @IsOptional()
  @IsString()
  messageId?: string;
}

export class MessageReadBrokerDto {
  @IsString()
  @IsObjectId()
  userId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one message ID is required' })
  @IsString({ each: true })
  @IsObjectId({ each: true })
  @Transform(({ value }: { value: string[] }) => Array.from(new Set(value)))
  messageIds: string[];
}
