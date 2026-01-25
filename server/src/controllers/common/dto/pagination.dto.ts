import { IsInt, IsOptional, Max, Min } from 'class-validator'
import { Transform } from 'class-transformer'

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(500)
  pageSize?: number

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  page?: number
}
