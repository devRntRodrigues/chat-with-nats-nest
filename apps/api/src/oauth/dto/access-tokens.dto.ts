import {
  IsString,
  IsNotEmpty,
  IsIn,
  ValidateIf,
  IsOptional,
} from 'class-validator';

type GrantType = 'client_credentials' | 'authorization_code' | 'refresh_token';

export class AccessTokensDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['client_credentials', 'authorization_code', 'refresh_token'], {
    message: 'Invalid grant type',
  })
  readonly grant_type: GrantType;

  @ValidateIf((o) => o.grant_type === 'authorization_code')
  @IsString()
  @IsNotEmpty()
  readonly code?: string;

  @IsString()
  @IsNotEmpty()
  readonly client_id: string;

  @IsString()
  @IsNotEmpty()
  readonly client_secret: string;

  @ValidateIf((o) => o.grant_type === 'authorization_code')
  @IsString()
  @IsNotEmpty()
  readonly redirect_uri?: string;

  @ValidateIf((o) => o.grant_type === 'refresh_token')
  @IsString()
  @IsNotEmpty()
  readonly refresh_token?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly scope: string;
}
