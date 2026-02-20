import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshClientSecretParamsDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
