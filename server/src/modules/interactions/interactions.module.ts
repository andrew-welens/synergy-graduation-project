import { Module } from '@nestjs/common'
import { InteractionsController } from './interactions.controller'
import { InteractionsService } from './interactions.service'
import { AuthModule } from '../auth/auth.module'
import { AuditModule } from '../audit/audit.module'
import { PrismaService } from '../../prisma/prisma.service'

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [InteractionsController],
  providers: [InteractionsService, PrismaService]
})
export class InteractionsModule {}
