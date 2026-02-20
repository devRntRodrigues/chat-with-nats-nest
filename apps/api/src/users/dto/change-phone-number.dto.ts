import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePhoneNumberDto {
  @IsNotEmpty()
  @IsString()
  phone: string;
}
