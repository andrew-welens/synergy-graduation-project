import { ApiProperty } from '@nestjs/swagger'

export class ApiEnvelopeDto {
  @ApiProperty()
  data!: unknown
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code!: string

  @ApiProperty({ example: 'Ошибка запроса' })
  message!: string
}
