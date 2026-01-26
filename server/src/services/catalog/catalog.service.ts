import { Prisma } from '@prisma/client'
import { type Category, type Product } from '../types/models'
import { CreateCategoryDto } from '../../controllers/catalog/dto/create-category.dto'
import { UpdateCategoryDto } from '../../controllers/catalog/dto/update-category.dto'
import { CreateProductDto } from '../../controllers/catalog/dto/create-product.dto'
import { UpdateProductDto } from '../../controllers/catalog/dto/update-product.dto'
import { CatalogQueryDto, ProductsQueryDto } from '../../controllers/catalog/dto/query.dto'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'
import { ApiError } from '../common/errors/api-error'

const buildContainsFilter = (value: string) => ({ contains: value, mode: Prisma.QueryMode.insensitive })

export class CatalogService {
  constructor(private readonly prisma: PrismaService, private readonly auditService: AuditService) {}

  async findCategories(query: CatalogQueryDto): Promise<{ data: Category[], total: number }> {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20
    const where = query.search
      ? { name: buildContainsFilter(query.search) }
      : {}
    const orderBy = this.buildCategoryOrderBy(query.sortBy, query.sortDir)
    const [total, rows] = await Promise.all([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize })
    ])
    return { data: rows as Category[], total }
  }

  async createCategory(actorId: string, dto: CreateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.create({
      data: { name: dto.name, description: dto.description }
    })
    await this.auditService.record(actorId, 'category.created', 'category', category.id)
    return category as Category
  }

  async updateCategory(actorId: string, id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) {
      throw new ApiError(404, 'NOT_FOUND', 'Not Found')
    }
    const updated = await this.prisma.category.update({
      where: { id },
      data: { name: dto.name ?? category.name, description: dto.description ?? category.description }
    })
    await this.auditService.record(actorId, 'category.updated', 'category', id)
    return updated as Category
  }

  async findProducts(query: ProductsQueryDto): Promise<{ data: Product[], total: number }> {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20
    const where: Prisma.ProductWhereInput = {}
    if (query.categoryId) where.categoryId = query.categoryId
    if (query.isAvailable !== undefined) where.isAvailable = query.isAvailable
    if (query.search) where.name = buildContainsFilter(query.search)
    const orderBy = this.buildProductOrderBy(query.sortBy, query.sortDir)
    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize })
    ])
    return { data: rows as Product[], total }
  }

  async createProduct(actorId: string, dto: CreateProductDto): Promise<Product> {
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } })
    if (!category) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Категория не найдена')
    }
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        price: dto.price,
        unit: dto.unit,
        isAvailable: dto.isAvailable,
        sku: dto.sku
      }
    })
    await this.auditService.record(actorId, 'product.created', 'product', product.id)
    return product as Product
  }

  async updateProduct(actorId: string, id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } })
    if (!product) {
      throw new ApiError(404, 'NOT_FOUND', 'Not Found')
    }
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } })
      if (!category) {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Категория не найдена')
      }
    }
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name ?? product.name,
        categoryId: dto.categoryId ?? product.categoryId,
        price: dto.price ?? product.price,
        unit: dto.unit ?? product.unit,
        isAvailable: dto.isAvailable ?? product.isAvailable,
        sku: dto.sku ?? product.sku
      }
    })
    await this.auditService.record(actorId, 'product.updated', 'product', id)
    return updated as Product
  }

  private buildCategoryOrderBy(sortBy?: 'name' | 'createdAt', sortDir?: 'asc' | 'desc') {
    const direction = sortDir ?? 'asc'
    if (sortBy === 'createdAt') {
      return { createdAt: direction }
    }
    return { name: direction }
  }

  private buildProductOrderBy(sortBy?: 'name' | 'price' | 'createdAt', sortDir?: 'asc' | 'desc') {
    const direction = sortDir ?? 'asc'
    if (sortBy === 'price') {
      return { price: direction }
    }
    if (sortBy === 'createdAt') {
      return { createdAt: direction }
    }
    return { name: direction }
  }
}
