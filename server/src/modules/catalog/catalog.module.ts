import { Module } from '@nestjs/common'
import { CatalogService } from './catalog.service'
import { CatalogController } from './catalog.controller'
import { AuthModule } from '../auth/auth.module'
import { AuditModule } from '../audit/audit.module'
import { PrismaService } from '../../prisma/prisma.service'

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [CatalogController],
  providers: [CatalogService, PrismaService]
})
export class CatalogModule {}
