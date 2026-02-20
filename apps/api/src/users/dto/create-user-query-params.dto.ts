import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserQueryParamsDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
