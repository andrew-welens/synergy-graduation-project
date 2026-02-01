import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateAnalyticsReportDto {
  @IsString()
  @MaxLength(200)
  name!: string

  @IsEnum(['orders', 'overdue'])
  reportType!: 'orders' | 'overdue'

  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>
}
