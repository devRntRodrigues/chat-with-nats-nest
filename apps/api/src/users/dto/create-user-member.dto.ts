import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserMemberDto {
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  externalId: string;
}
