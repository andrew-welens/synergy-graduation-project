import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { ClientsModule } from './modules/clients/clients.module'
import { CatalogModule } from './modules/catalog/catalog.module'
import { OrdersModule } from './modules/orders/orders.module'
import { InteractionsModule } from './modules/interactions/interactions.module'
import { UsersModule } from './modules/users/users.module'
import { AuditModule } from './modules/audit/audit.module'
import { ReportsModule } from './modules/reports/reports.module'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { PrismaService } from './prisma/prisma.service'
import { BootstrapService } from './bootstrap.service'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100
      }
    ]),
    AuthModule,
    ClientsModule,
    CatalogModule,
    OrdersModule,
    InteractionsModule,
    UsersModule,
    AuditModule,
    ReportsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    PrismaService,
    BootstrapService
  ]
})
export class AppModule {}
