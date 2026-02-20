import { IsString, MinLength, IsOptional, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsObjectId } from '@/common/decorators/is-oject-id.decorator';

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
  @IsString({ each: true })
  @IsObjectId({ each: true })
  @Transform(({ value }: { value: string[] }) => Array.from(new Set(value)))
  messageIds: string[];
}
