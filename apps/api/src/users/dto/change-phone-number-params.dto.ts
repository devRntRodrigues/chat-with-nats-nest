import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePhoneNumberParamsDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
