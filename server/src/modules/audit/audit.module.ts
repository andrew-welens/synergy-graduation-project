import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuditController } from './audit.controller'
import { AuditService } from './audit.service'
import { PrismaService } from '../../prisma/prisma.service'

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret'
    })
  ],
  controllers: [AuditController],
  providers: [AuditService, PrismaService],
  exports: [AuditService]
})
export class AuditModule {}
