import { Module } from '@nestjs/common'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { OrdersPrismaService } from './orders.prisma.service'
import { AuthModule } from '../auth/auth.module'
import { PrismaService } from '../../prisma/prisma.service'
import { AuditModule } from '../audit/audit.module'

@Module({
  imports: [AuthModule, AuditModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersPrismaService, PrismaService]
})
export class OrdersModule {}
