export class InteractionResponseDto {
  id!: string

  clientId!: string

  channel!: string

  description!: string

  managerId?: string

  createdAt!: string
}

export class InteractionsListResponseDto {
  data!: InteractionResponseDto[]

  total!: number
}
