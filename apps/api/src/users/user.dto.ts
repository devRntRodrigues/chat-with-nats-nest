import { IsString, IsOptional, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsObjectId } from '@/common/decorators/is-oject-id.decorator';

export class ListUsersQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value?.trim())
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 30;

  @IsOptional()
  @IsString()
  @IsObjectId()
  cursor?: string;
}
