import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateClientParamsDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
