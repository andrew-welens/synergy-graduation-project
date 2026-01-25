import { IsOptional, IsString, MinLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class RefreshDto {
  @ApiPropertyOptional({ example: 'refresh.jwt.token', minLength: 10 })
  @IsOptional()
  @IsString()
  @MinLength(10)
  refreshToken?: string
}
