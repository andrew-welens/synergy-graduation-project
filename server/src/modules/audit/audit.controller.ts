import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AuditService } from './audit.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Permissions } from '../../common/decorators/permissions.decorator'
import { AuditQueryDto } from './dto/audit-query.dto'
import { ApiBearerAuth, ApiExtraModels, ApiForbiddenResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiEnvelopeDto, ApiErrorResponseDto } from '../../common/dto/api-response.dto'
import { AuditListResponseDto, AuditLogResponseDto } from './dto/audit-response.dto'

@ApiTags('audit')
@ApiExtraModels(ApiEnvelopeDto, ApiErrorResponseDto, AuditListResponseDto, AuditLogResponseDto)
@ApiBearerAuth()
@Controller('api/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Permissions('audit.read')
  @ApiOkResponse({
    description: 'Список событий аудита',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(AuditListResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  list(@Query() query: AuditQueryDto) {
    return this.auditService.list(query)
  }
}
