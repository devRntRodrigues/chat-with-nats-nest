import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty({ each: true })
  @IsUrl({}, { each: true })
  redirectUris: string[];
}
