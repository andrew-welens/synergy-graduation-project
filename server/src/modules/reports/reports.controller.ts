import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Permissions } from '../../common/decorators/permissions.decorator'
import { OrdersReportQueryDto } from './dto/orders-report-query.dto'
import { OverdueReportQueryDto } from './dto/overdue-report-query.dto'
import { ApiBearerAuth, ApiExtraModels, ApiForbiddenResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiEnvelopeDto, ApiErrorResponseDto } from '../../common/dto/api-response.dto'
import { OrdersReportResponseDto, OverdueReportResponseDto } from './dto/reports-response.dto'

@ApiTags('reports')
@ApiExtraModels(ApiEnvelopeDto, ApiErrorResponseDto, OrdersReportResponseDto, OverdueReportResponseDto)
@ApiBearerAuth()
@Controller('api/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('orders')
  @Permissions('reports.read')
  @ApiOkResponse({
    description: 'Отчет по заказам',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(OrdersReportResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  orders(@Query() query: OrdersReportQueryDto) {
    return this.reportsService.orders(query)
  }

  @Get('overdue')
  @Permissions('reports.read')
  @ApiOkResponse({
    description: 'Просроченные заказы',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(OverdueReportResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  overdue(@Query() query: OverdueReportQueryDto) {
    return this.reportsService.overdue(query)
  }
}
