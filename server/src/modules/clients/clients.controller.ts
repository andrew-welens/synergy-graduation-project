import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Permissions } from '../../common/decorators/permissions.decorator'
import { CurrentUser, type RequestUser } from '../../common/decorators/current-user.decorator'
import { ClientsQueryDto } from './dto/clients-query.dto'
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiExtraModels, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiEnvelopeDto, ApiErrorResponseDto } from '../../common/dto/api-response.dto'
import { ClientResponseDto, ClientsListResponseDto } from './dto/client-response.dto'

@ApiTags('clients')
@ApiExtraModels(ApiEnvelopeDto, ApiErrorResponseDto, ClientResponseDto, ClientsListResponseDto)
@ApiBearerAuth()
@Controller('api/clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @Permissions('clients.read')
  @ApiOkResponse({
    description: 'Список клиентов',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(ClientsListResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  findAll(@Query() query: ClientsQueryDto) {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20
    return this.clientsService.findAll(page, pageSize, query.hasOrders, query.search, query.type, query.sortBy, query.sortDir)
  }

  @Get(':id')
  @Permissions('clients.read')
  @ApiOkResponse({
    description: 'Карточка клиента',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(ClientResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiNotFoundResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id)
  }

  @Post()
  @Permissions('clients.write')
  @ApiCreatedResponse({
    description: 'Клиент создан',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(ClientResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiBadRequestResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiConflictResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateClientDto) {
    return this.clientsService.create(user?.id ?? 'unknown', dto)
  }

  @Put(':id')
  @Permissions('clients.write')
  @ApiOkResponse({
    description: 'Клиент обновлен',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(ClientResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiBadRequestResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiConflictResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiNotFoundResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(user?.id ?? 'unknown', id, dto)
  }

  @Delete(':id')
  @Permissions('clients.delete')
  @ApiOkResponse({
    description: 'Клиент удален',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { type: 'object', properties: { message: { type: 'string' } } } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiNotFoundResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.clientsService.remove(user?.id ?? 'unknown', id)
  }
}
