import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { CatalogService } from './catalog.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Permissions } from '../../common/decorators/permissions.decorator'
import { CurrentUser, type RequestUser } from '../../common/decorators/current-user.decorator'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { CatalogQueryDto, ProductsQueryDto } from './dto/query.dto'
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiExtraModels, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger'
import { ApiEnvelopeDto, ApiErrorResponseDto } from '../../common/dto/api-response.dto'
import { CategoryResponseDto, CategoriesListResponseDto, ProductResponseDto, ProductsListResponseDto } from './dto/catalog-response.dto'

@ApiTags('catalog')
@ApiExtraModels(ApiEnvelopeDto, ApiErrorResponseDto, CategoryResponseDto, CategoriesListResponseDto, ProductResponseDto, ProductsListResponseDto)
@ApiBearerAuth()
@Controller('api')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  @Permissions('catalog.read')
  @ApiOkResponse({
    description: 'Список категорий',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(CategoriesListResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  categories(@Query() query: CatalogQueryDto) {
    return this.catalogService.findCategories(query)
  }

  @Post('categories')
  @Permissions('catalog.write')
  @ApiCreatedResponse({
    description: 'Категория создана',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(CategoryResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiBadRequestResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  createCategory(@CurrentUser() user: RequestUser, @Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(user?.id ?? 'unknown', dto)
  }

  @Put('categories/:id')
  @Permissions('catalog.write')
  @ApiOkResponse({
    description: 'Категория обновлена',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(CategoryResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiBadRequestResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiNotFoundResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  updateCategory(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.catalogService.updateCategory(user?.id ?? 'unknown', id, dto)
  }

  @Get('products')
  @Permissions('catalog.read')
  @ApiOkResponse({
    description: 'Список товаров',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(ProductsListResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  products(@Query() query: ProductsQueryDto) {
    return this.catalogService.findProducts(query)
  }

  @Post('products')
  @Permissions('catalog.write')
  @ApiCreatedResponse({
    description: 'Товар создан',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(ProductResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiBadRequestResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  createProduct(@CurrentUser() user: RequestUser, @Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(user?.id ?? 'unknown', dto)
  }

  @Put('products/:id')
  @Permissions('catalog.write')
  @ApiOkResponse({
    description: 'Товар обновлен',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiEnvelopeDto) },
        { properties: { data: { $ref: getSchemaPath(ProductResponseDto) } } }
      ]
    }
  })
  @ApiUnauthorizedResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiForbiddenResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiBadRequestResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  @ApiNotFoundResponse({ schema: { $ref: getSchemaPath(ApiErrorResponseDto) } })
  updateProduct(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(user?.id ?? 'unknown', id, dto)
  }
}
