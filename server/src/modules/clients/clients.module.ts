import { Module } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { ClientsController } from './clients.controller'
import { AuthModule } from '../auth/auth.module'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditModule } from '../audit/audit.module'

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [ClientsController],
  providers: [ClientsService, PrismaService]
})
export class ClientsModule {}
