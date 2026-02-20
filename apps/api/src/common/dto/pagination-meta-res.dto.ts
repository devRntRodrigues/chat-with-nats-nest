import { IsNumber } from "class-validator";
import { Expose } from "class-transformer";

export class PaginationMetaResDto {
  @Expose()
  @IsNumber()
  page: number;

  @Expose()
  @IsNumber()
  limit: number;

  @Expose()
  @IsNumber()
  itemCount: number;

  @Expose()
  @IsNumber()
  pageCount: number;

  @Expose()
  @IsNumber()
  hasPreviousPage: boolean;

  @Expose()
  @IsNumber()
  hasNextPage: boolean;
}
