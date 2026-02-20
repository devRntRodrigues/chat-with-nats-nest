import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { trimmer } from '../../common/utils';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;

  @Transform(trimmer)
  @IsNotEmpty()
  @IsNumberString()
  readonly code: string;

  @IsNotEmpty()
  @IsString()
  readonly client_id: string;

  @IsNotEmpty()
  @IsString()
  readonly redirect_uri: string;
}
