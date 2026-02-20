import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString, Length } from 'class-validator';
import { trimmer } from '../../common/utils';

export class SendVerificationCodeDto {
  @Transform(trimmer)
  @IsNotEmpty()
  @IsNumberString()
  @Length(10, 11)
  phone: string;
}
