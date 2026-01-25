import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { InteractionsService } from './interactions.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Permissions } from '../../common/decorators/permissions.decorator'
import { CurrentUser, type RequestUser } from '../../common/decorators/current-user.decorator'
import { CreateInteractionDto } from './dto/create-interaction.dto'
import { InteractionsQueryDto } from './dto/interactions-query.dto'
import { UpdateInteractionDto } from './dto/update-interaction.dto'
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiExtraModels, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiEnvelopeDto, ApiErrorResponseDto } from '../../common/dto/api-response.dto'
import { InteractionResponseDto, InteractionsListResponseDto } from './dto/interaction-response.dto'

@ApiTags('interactions')
@ApiExtraModels(ApiEnvelopeDto, ApiErrorResponseDto, InteractionResponseDto, InteractionsListResponseDto)
@ApiBearerAuth()
@Controller('api/clients/:clientId/interactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Get()
  @Permissions('interactions.read')
  @ApiOkResponse({
    description: 'Список взаимодействий',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(InteractionsListResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  list(@Param('clientId') clientId: string, @Query() query: InteractionsQueryDto) {
    return this.interactionsService.list(clientId, query)
  }

  @Post()
  @Permissions('interactions.write')
  @ApiCreatedResponse({
    description: 'Взаимодействие создано',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(InteractionResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiBadRequestResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiNotFoundResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  create(@CurrentUser() user: RequestUser, @Param('clientId') clientId: string, @Body() dto: CreateInteractionDto) {
    return this.interactionsService.create(user?.id ?? 'unknown', clientId, dto)
  }

  @Put(':id')
  @Permissions('interactions.write')
  @ApiOkResponse({
    description: 'Взаимодействие обновлено',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(InteractionResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiBadRequestResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiNotFoundResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  update(@CurrentUser() user: RequestUser, @Param('clientId') clientId: string, @Param('id') id: string, @Body() dto: UpdateInteractionDto) {
    return this.interactionsService.update(user?.id ?? 'unknown', clientId, id, dto)
  }

  @Delete(':id')
  @Permissions('interactions.write')
  @ApiOkResponse({
    description: 'Взаимодействие удалено',
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
  remove(@CurrentUser() user: RequestUser, @Param('clientId') clientId: string, @Param('id') id: string) {
    return this.interactionsService.remove(user?.id ?? 'unknown', clientId, id)
  }
}
