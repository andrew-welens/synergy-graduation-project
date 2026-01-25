import { IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateInteractionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  channel?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string
}
