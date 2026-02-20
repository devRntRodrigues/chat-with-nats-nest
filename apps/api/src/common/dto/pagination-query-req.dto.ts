import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";
import { Type } from "class-transformer";
import { TransformSortOrder } from "../decorators/transform-sort-order.decorator";

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export class PaginationQueryReqDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  readonly limit?: number;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  readonly page?: number;

  @IsString()
  @IsOptional()
  readonly sortField?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  @TransformSortOrder()
  readonly sortOrder?: SortOrder;
}
