import { IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @Matches(/^[a-z0-9_]+$/, {
    message:
      'Username can only contain lowercase letters, numbers, and underscores',
  })
  @Transform(({ value }) => value?.trim().toLowerCase())
  username: string;

  @IsString()
  password: string;
}

export class LoginDto {
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  username: string;

  @IsString()
  password: string;
}
