import { Router } from 'express'
import { CatalogService } from '../../services/catalog/catalog.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { CatalogQueryDto, ProductsQueryDto } from './dto/query.dto'
import { asyncHandler } from '../../middleware/async-handler'
import { validateBody, validateQuery } from '../../middleware/validate'
import { requireAuth } from '../../middleware/auth'
import { requirePermissions } from '../../middleware/permissions'
import { sendData } from '../../services/utils/response'
import { PrismaService } from '../../services/prisma/prisma.service'

export const createCatalogRouter = (catalogService: CatalogService, prisma: PrismaService) => {
  const router = Router()

  router.use(requireAuth(prisma))

  router.get(
    '/categories',
    requirePermissions('catalog.read'),
    validateQuery(CatalogQueryDto),
    asyncHandler(async (req, res) => {
      const query = res.locals.query as CatalogQueryDto
      const result = await catalogService.findCategories(query)
      sendData(res, result)
    })
  )

  router.post(
    '/categories',
    requirePermissions('catalog.write'),
    validateBody(CreateCategoryDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as CreateCategoryDto
      const result = await catalogService.createCategory(req.user?.id ?? 'unknown', dto)
      sendData(res, result, 201)
    })
  )

  router.put(
    '/categories/:id',
    requirePermissions('catalog.write'),
    validateBody(UpdateCategoryDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as UpdateCategoryDto
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await catalogService.updateCategory(req.user?.id ?? 'unknown', id, dto)
      sendData(res, result)
    })
  )

  router.get(
    '/products',
    requirePermissions('catalog.read'),
    validateQuery(ProductsQueryDto),
    asyncHandler(async (req, res) => {
      const query = res.locals.query as ProductsQueryDto
      const result = await catalogService.findProducts(query)
      sendData(res, result)
    })
  )

  router.post(
    '/products',
    requirePermissions('catalog.write'),
    validateBody(CreateProductDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as CreateProductDto
      const result = await catalogService.createProduct(req.user?.id ?? 'unknown', dto)
      sendData(res, result, 201)
    })
  )

  router.put(
    '/products/:id',
    requirePermissions('catalog.write'),
    validateBody(UpdateProductDto),
    asyncHandler(async (req, res) => {
      const dto = req.body as UpdateProductDto
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await catalogService.updateProduct(req.user?.id ?? 'unknown', id, dto)
      sendData(res, result)
    })
  )

  return router
}
