import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteClientParamsDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
