export class ClientResponseDto {
  id!: string

  name!: string

  email?: string

  phone?: string

  city?: string

  address?: string

  managerId?: string

  tags!: string[]

  type!: 'legal' | 'individual'

  inn?: string

  createdAt!: string

  updatedAt!: string

  ordersCount?: number

  interactionsCount?: number
}

export class ClientsListResponseDto {
  data!: ClientResponseDto[]

  total!: number
}
