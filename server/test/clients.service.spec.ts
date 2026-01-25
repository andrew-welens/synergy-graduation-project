import { ConflictException } from '@nestjs/common'
import { ClientsService } from '../src/modules/clients/clients.service'
import { type CreateClientDto } from '../src/modules/clients/dto/create-client.dto'
import { type PrismaService } from '../src/prisma/prisma.service'
import { type AuditService } from '../src/modules/audit/audit.service'

const createService = () => {
  const prisma = {
    client: {
      findFirst: jest.fn(),
      create: jest.fn()
    }
  } as unknown as PrismaService
  const audit = {
    record: jest.fn()
  } as unknown as AuditService
  const service = new ClientsService(prisma, audit)
  return { service, prisma, audit }
}

describe('ClientsService', () => {
  it('создает клиента и пишет аудит', async () => {
    const { service, prisma, audit } = createService()
    prisma.client.findFirst = jest.fn().mockResolvedValue(null)
    prisma.client.create = jest.fn().mockResolvedValue({
      id: 'client-1',
      name: 'ООО Ромашка',
      email: 'info@romashka.ru',
      phone: '+79990000000',
      city: 'Москва',
      address: 'Москва, ул. Пушкина, 1',
      managerId: null,
      tags: JSON.stringify(['vip']),
      type: 'legal',
      inn: '7700000000',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    const payload: CreateClientDto = {
      name: 'ООО Ромашка',
      email: 'INFO@romashka.ru',
      phone: '+79990000000',
      city: 'Москва',
      address: 'Москва, ул. Пушкина, 1',
      tags: ['vip'],
      type: 'legal',
      inn: '7700000000'
    }
    const result = await service.create('user-1', payload)
    expect(result.email).toBe('info@romashka.ru')
    expect(result.tags).toEqual(['vip'])
    expect(audit.record).toHaveBeenCalledWith('user-1', 'client.created', 'client', 'client-1')
  })

  it('отклоняет дубликат клиента', async () => {
    const { service, prisma } = createService()
    prisma.client.findFirst = jest.fn().mockResolvedValue({ id: 'client-1' })
    const payload: CreateClientDto = {
      name: 'ООО Ромашка',
      email: 'info@romashka.ru',
      phone: '+79990000000',
      city: 'Москва',
      address: 'Москва, ул. Пушкина, 1',
      tags: ['vip'],
      type: 'legal',
      inn: '7700000000'
    }
    await expect(service.create('user-1', payload)).rejects.toBeInstanceOf(ConflictException)
  })
})
