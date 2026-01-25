import { IsOptional, IsString, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateInteractionDto {
  @ApiProperty({ example: 'Звонок' })
  @IsString()
  @MinLength(1)
  channel!: string

  @ApiProperty({ example: 'Обсудили условия' })
  @IsString()
  @MinLength(1)
  description!: string

  @ApiPropertyOptional({ format: 'uuid', example: 'manager-id' })
  @IsOptional()
  @IsString()
  managerId?: string
}
