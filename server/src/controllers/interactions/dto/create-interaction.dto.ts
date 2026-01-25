import { IsOptional, IsString, MinLength } from 'class-validator'

export class CreateInteractionDto {
  @IsString()
  @MinLength(1)
  channel!: string

  @IsString()
  @MinLength(1)
  description!: string

  @IsOptional()
  @IsString()
  managerId?: string
}
