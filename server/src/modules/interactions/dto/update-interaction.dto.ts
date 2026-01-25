import { IsOptional, IsString, MinLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateInteractionDto {
  @ApiPropertyOptional({ example: 'Встреча' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  channel?: string

  @ApiPropertyOptional({ example: 'Уточнили требования' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string
}
