import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Permissions } from '../../common/decorators/permissions.decorator'
import { CurrentUser, type RequestUser } from '../../common/decorators/current-user.decorator'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateStatusDto } from './dto/update-status.dto'
import { OrdersQueryDto } from './dto/orders-query.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiExtraModels, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiEnvelopeDto, ApiErrorResponseDto } from '../../common/dto/api-response.dto'
import { OrderResponseDto, OrdersListResponseDto } from './dto/order-response.dto'

@ApiTags('orders')
@ApiExtraModels(ApiEnvelopeDto, ApiErrorResponseDto, OrderResponseDto, OrdersListResponseDto)
@ApiBearerAuth()
@Controller('api/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Permissions('orders.read')
  @ApiOkResponse({
    description: 'Список заказов',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(OrdersListResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  list(@Query() query: OrdersQueryDto) {
    return this.ordersService.findAll(query)
  }

  @Get(':id')
  @Permissions('orders.read')
  @ApiOkResponse({
    description: 'Карточка заказа',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(OrderResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiNotFoundResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  get(@Param('id') id: string) {
    return this.ordersService.findOne(id)
  }

  @Post()
  @Permissions('orders.write')
  @ApiCreatedResponse({
    description: 'Заказ создан',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(OrderResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiBadRequestResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiNotFoundResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiConflictResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user?.id ?? 'unknown', dto)
  }

  @Post(':id/status')
  @Permissions('orders.status.change')
  @ApiOkResponse({
    description: 'Статус обновлен',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(OrderResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiNotFoundResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiConflictResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  updateStatus(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.ordersService.updateStatus(user?.id ?? 'unknown', user?.role ?? 'unknown', id, dto)
  }

  @Put(':id')
  @Permissions('orders.write')
  @ApiOkResponse({
    description: 'Заказ обновлен',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(OrderResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiBadRequestResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiNotFoundResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(user?.id ?? 'unknown', user?.role ?? 'unknown', id, dto)
  }
}
