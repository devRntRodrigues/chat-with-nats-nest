import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User full name',
    minLength: 2,
    maxLength: 50,
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description:
      'Unique username (lowercase letters, numbers, and underscores only)',
    minLength: 3,
    maxLength: 30,
    example: 'johndoe',
  })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  @Matches(/^[a-z0-9_]+$/, {
    message:
      'Username can only contain lowercase letters, numbers, and underscores',
  })
  @Transform(({ value }) => value?.trim().toLowerCase())
  username: string;

  @ApiProperty({
    description: 'User password',
    minLength: 8,
    example: 'SecurePass123!',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  username: string;

  @ApiProperty({
    description: 'Password',
    example: 'SecurePass123!',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}
