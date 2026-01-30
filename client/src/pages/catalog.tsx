import { useEffect, useState } from 'react'
import { catalogApi } from '../services/catalog'
import { type Category, type Product } from '../services/types'
import { useAuth } from '../utils/auth'
import { useMinLoading } from '../hooks/use-min-loading'
import { RetryPanel } from '../components/retry-panel'
import { useDebounce } from '../hooks/use-debounce'
import { SkeletonTable } from '../components/skeleton-table'
import { Pagination } from '../components/pagination'
import { EmptyState } from '../components/empty-state'

export default function CatalogPage() {
  const { isAuthenticated, initialized, role } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesTotal, setCategoriesTotal] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [productsTotal, setProductsTotal] = useState(0)
  const { loading, startLoading, stopLoading } = useMinLoading()
  const [error, setError] = useState<string | null>(null)
  const [catForm, setCatForm] = useState({ name: '', description: '' })
  const [prodForm, setProdForm] = useState({ name: '', categoryId: '', price: '', unit: 'шт' as 'шт' | 'усл.' | 'мес.', isAvailable: true, sku: '' })
  const [categorySearch, setCategorySearch] = useState('')
  const debouncedCategorySearch = useDebounce(categorySearch, 300)
  const [categorySortBy, setCategorySortBy] = useState<'name' | 'createdAt'>('name')
  const [categorySortDir, setCategorySortDir] = useState<'asc' | 'desc'>('asc')
  const [productSearch, setProductSearch] = useState('')
  const debouncedProductSearch = useDebounce(productSearch, 300)
  const [productSortBy, setProductSortBy] = useState<'name' | 'price'>('name')
  const [productSortDir, setProductSortDir] = useState<'asc' | 'desc'>('asc')
  const [productCategoryId, setProductCategoryId] = useState('')
  const [productAvailability, setProductAvailability] = useState<'all' | 'available' | 'unavailable'>('all')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editCategoryForm, setEditCategoryForm] = useState({ name: '', description: '' })
  const [editProductForm, setEditProductForm] = useState({ name: '', categoryId: '', price: '', unit: 'шт' as 'шт' | 'усл.' | 'мес.', isAvailable: true, sku: '' })
  const [categoryPage, setCategoryPage] = useState(1)
  const [productPage, setProductPage] = useState(1)
  const categoriesPageSize = 20
  const productsPageSize = 20
  const categoriesTotalPages = Math.max(1, Math.ceil(categoriesTotal / categoriesPageSize))
  const productsTotalPages = Math.max(1, Math.ceil(productsTotal / productsPageSize))
  const [reloadKey, setReloadKey] = useState(0)
  const sortedCategories = [...categories].sort((a, b) => {
    const multiplier = categorySortDir === 'asc' ? 1 : -1
    if (categorySortBy === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier
    }
    return a.name.localeCompare(b.name) * multiplier
  })

  const sortedProducts = [...products].sort((a, b) => {
    const multiplier = productSortDir === 'asc' ? 1 : -1
    if (productSortBy === 'price') {
      return (a.price - b.price) * multiplier
    }
    return a.name.localeCompare(b.name) * multiplier
  })

  const canRead = role === 'admin' || role === 'manager' || role === 'operator'
  const canWrite = role === 'admin' || role === 'manager'
  const createCategoryName = catForm.name.trim()
  const editCategoryName = editCategoryForm.name.trim()
  const createProductName = prodForm.name.trim()
  const editProductName = editProductForm.name.trim()
  const createProductPrice = Number(prodForm.price.trim())
  const editProductPrice = Number(editProductForm.price.trim())
  const isCreateCategoryValid = createCategoryName.length > 0
  const isEditCategoryValid = editCategoryName.length > 0
  const isCreateProductValid = createProductName.length > 0 && Boolean(prodForm.categoryId) && Number.isFinite(createProductPrice) && createProductPrice >= 0
  const isEditProductValid = editProductName.length > 0 && Boolean(editProductForm.categoryId) && Number.isFinite(editProductPrice) && editProductPrice >= 0
  const createCategoryDisabledReason = createCategoryName.length === 0 ? 'Введите название' : ''
  const editCategoryDisabledReason = editCategoryName.length === 0 ? 'Введите название' : ''
  const createProductDisabledReason = createProductName.length === 0
    ? 'Введите название'
    : !prodForm.categoryId
      ? 'Выберите категорию'
      : !Number.isFinite(createProductPrice) || createProductPrice < 0
        ? 'Введите корректную цену'
        : ''
  const editProductDisabledReason = editProductName.length === 0
    ? 'Введите название'
    : !editProductForm.categoryId
      ? 'Выберите категорию'
      : !Number.isFinite(editProductPrice) || editProductPrice < 0
        ? 'Введите корректную цену'
        : ''

  useEffect(() => {
    if (!initialized || !isAuthenticated) return
    if (!canRead) return
    startLoading()
    Promise.all([
      catalogApi.categories({ page: categoryPage, pageSize: categoriesPageSize, search: debouncedCategorySearch || undefined }),
      catalogApi.products({
        page: productPage,
        pageSize: productsPageSize,
        search: debouncedProductSearch || undefined,
        categoryId: productCategoryId || undefined,
        isAvailable: productAvailability === 'all' ? undefined : productAvailability === 'available'
      })
    ])
      .then(([cats, prods]) => {
        setCategories(cats.data)
        setCategoriesTotal(cats.total)
        setProducts(prods.data)
        setProductsTotal(prods.total)
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => stopLoading())
  }, [initialized, isAuthenticated, canRead, debouncedCategorySearch, debouncedProductSearch, productCategoryId, productAvailability, categoryPage, productPage, categoriesPageSize, productsPageSize, reloadKey])

  const handleRetry = () => {
    setError(null)
    setReloadKey((prev) => prev + 1)
  }

  if (!canRead) {
    return (
      <div className="card">
        <div className="empty-state">Недостаточно прав для просмотра каталога</div>
      </div>
    )
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const name = catForm.name.trim()
    if (!name) {
      setError('Введите название категории')
      return
    }
    startLoading()
    try {
      const created = await catalogApi.createCategory({ name, description: catForm.description.trim() || undefined })
      setCategories((prev) => [created, ...prev])
      setCategoriesTotal((prev) => prev + 1)
      setCatForm({ name: '', description: '' })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      stopLoading()
    }
  }

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id)
    setEditCategoryForm({ name: category.name, description: category.description ?? '' })
  }

  const startEditProduct = (product: Product) => {
    setEditingProductId(product.id)
    setEditProductForm({
      name: product.name,
      categoryId: product.categoryId,
      price: String(product.price),
      unit: product.unit as 'шт' | 'усл.' | 'мес.',
      isAvailable: product.isAvailable,
      sku: product.sku ?? ''
    })
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategoryId) return
    setError(null)
    const name = editCategoryForm.name.trim()
    if (!name) {
      setError('Введите название категории')
      return
    }
    startLoading()
    try {
      const updated = await catalogApi.updateCategory(editingCategoryId, {
        name,
        description: editCategoryForm.description.trim() || undefined
      })
      setCategories((prev) => prev.map((c) => c.id === updated.id ? updated : c))
      setEditingCategoryId(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      stopLoading()
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const name = prodForm.name.trim()
    if (!name) {
      setError('Введите название товара')
      return
    }
    if (!prodForm.categoryId) {
      setError('Выберите категорию')
      return
    }
    const priceValue = prodForm.price.trim()
    if (!priceValue) {
      setError('Введите цену')
      return
    }
    const price = Number(priceValue)
    if (!Number.isFinite(price) || price < 0) {
      setError('Некорректная цена')
      return
    }
    startLoading()
    try {
      const created = await catalogApi.createProduct({
        name,
        categoryId: prodForm.categoryId,
        price,
        unit: prodForm.unit,
        isAvailable: prodForm.isAvailable,
        sku: prodForm.sku.trim() || undefined
      })
      setProducts((prev) => [created, ...prev])
      setProductsTotal((prev) => prev + 1)
      setProdForm({ name: '', categoryId: '', price: '', unit: 'шт', isAvailable: true, sku: '' })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      stopLoading()
    }
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProductId) return
    setError(null)
    const name = editProductForm.name.trim()
    if (!name) {
      setError('Введите название товара')
      return
    }
    if (!editProductForm.categoryId) {
      setError('Выберите категорию')
      return
    }
    const priceValue = editProductForm.price.trim()
    if (!priceValue) {
      setError('Введите цену')
      return
    }
    const price = Number(priceValue)
    if (!Number.isFinite(price) || price < 0) {
      setError('Некорректная цена')
      return
    }
    startLoading()
    try {
      const updated = await catalogApi.updateProduct(editingProductId, {
        name,
        categoryId: editProductForm.categoryId,
        price,
        unit: editProductForm.unit,
        isAvailable: editProductForm.isAvailable,
        sku: editProductForm.sku.trim() || undefined
      })
      setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p))
      setEditingProductId(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      stopLoading()
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3>Категории</h3>
          <span style={{ color: '#64748b', fontSize: 14 }}>{categoriesTotal}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input className="input" placeholder="Поиск категорий" value={categorySearch} onChange={(e) => { setCategorySearch(e.target.value); setCategoryPage(1) }} />
          <select className="input" value={categorySortBy} onChange={(e) => setCategorySortBy(e.target.value as 'name' | 'createdAt')}>
            <option value="name">Сортировка: название</option>
            <option value="createdAt">Сортировка: дата</option>
          </select>
          <button className="btn secondary" type="button" onClick={() => setCategorySortDir((prev) => prev === 'asc' ? 'desc' : 'asc')}>
            {categorySortDir === 'asc' ? 'По возр.' : 'По убыв.'}
          </button>
        </div>
        {canWrite && (
          <form className="grid" style={{ gap: 8, gridTemplateColumns: '1fr 1fr auto', marginBottom: 12 }} onSubmit={handleCreateCategory}>
            <input className="input" required placeholder="Название" value={catForm.name} onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))} />
            <input className="input" placeholder="Описание" value={catForm.description} onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))} />
            <span title={!isCreateCategoryValid ? createCategoryDisabledReason : undefined} style={{ display: 'inline-block' }}>
              <button className="btn" type="submit" disabled={loading || !isCreateCategoryValid}>Добавить</button>
            </span>
          </form>
        )}
        {loading && <SkeletonTable rows={5} cols={5} />}
        {error && <RetryPanel message={error} onRetry={handleRetry} />}
        {canWrite && editingCategoryId && (
          <form className="grid" style={{ gap: 8, gridTemplateColumns: '1fr 1fr auto', marginBottom: 12 }} onSubmit={handleUpdateCategory}>
            <input className="input" required placeholder="Название" value={editCategoryForm.name} onChange={(e) => setEditCategoryForm((f) => ({ ...f, name: e.target.value }))} />
            <input className="input" placeholder="Описание" value={editCategoryForm.description} onChange={(e) => setEditCategoryForm((f) => ({ ...f, description: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8 }}>
              <span title={!isEditCategoryValid ? editCategoryDisabledReason : undefined} style={{ display: 'inline-block' }}>
                <button className="btn" type="submit" disabled={loading || !isEditCategoryValid}>Сохранить</button>
              </span>
              <button className="btn secondary" type="button" onClick={() => setEditingCategoryId(null)}>Отмена</button>
            </div>
          </form>
        )}
        {!loading && !error && (
          <>
            {categories.length === 0 ? (
              <EmptyState
                title="Категорий пока нет"
                description="Создайте первую категорию для организации товаров"
                icon="empty"
                action={canWrite && <button className="btn secondary" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Добавить категорию</button>}
              />
            ) : (
              <>
                <div className="table-wrap">
                  <table className="table">
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Описание</th>
                      {canWrite && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCategories.map((c) => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.description}</td>
                        {canWrite && (
                          <td>
                            <button className="btn secondary" type="button" onClick={() => startEditCategory(c)}>Редактировать</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
                <div className="table-mobile">
                  {sortedCategories.map((c) => (
                    <div key={c.id} className="table-mobile-card">
                      <div className="table-mobile-row">
                        <div className="table-mobile-label">Название</div>
                        <div className="table-mobile-value">{c.name}</div>
                      </div>
                      <div className="table-mobile-row">
                        <div className="table-mobile-label">Описание</div>
                        <div className="table-mobile-value">{c.description || '—'}</div>
                      </div>
                      {canWrite && (
                        <div className="table-mobile-actions">
                          <button className="btn secondary" type="button" onClick={() => startEditCategory(c)}>Редактировать</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {categoriesTotalPages > 1 && (
                  <Pagination
                    page={categoryPage}
                    totalPages={categoriesTotalPages}
                    total={categoriesTotal}
                    pageSize={categoriesPageSize}
                    onPageChange={setCategoryPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3>Товары</h3>
          <span style={{ color: '#64748b', fontSize: 14 }}>{productsTotal}</span>
        </div>
        <p className="card-section-title">Поиск и фильтры</p>
        <div className="grid" style={{ gap: 8, gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 16 }}>
          <input className="input" placeholder="Поиск товаров" value={productSearch} onChange={(e) => { setProductSearch(e.target.value); setProductPage(1) }} />
          <select className="input" value={productCategoryId} onChange={(e) => { setProductCategoryId(e.target.value); setProductPage(1) }}>
            <option value="">Все категории</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input" value={productAvailability} onChange={(e) => { setProductAvailability(e.target.value as 'all' | 'available' | 'unavailable'); setProductPage(1) }}>
            <option value="all">Доступность: все</option>
            <option value="available">Только доступные</option>
            <option value="unavailable">Только недоступные</option>
          </select>
          <select className="input" value={productSortBy} onChange={(e) => setProductSortBy(e.target.value as 'name' | 'price')}>
            <option value="name">Сортировка: название</option>
            <option value="price">Сортировка: цена</option>
          </select>
          <button className="btn secondary" type="button" onClick={() => setProductSortDir((prev) => prev === 'asc' ? 'desc' : 'asc')}>
            {productSortDir === 'asc' ? 'По возр.' : 'По убыв.'}
          </button>
        </div>
        {canWrite && (
          <div className="card-form-block">
            <p className="card-section-title">Новый товар</p>
            <form className="grid" style={{ gap: 8, gridTemplateColumns: 'repeat(5, 1fr)' }} onSubmit={handleCreateProduct}>
            <input className="input" required placeholder="Название" value={prodForm.name} onChange={(e) => setProdForm((f) => ({ ...f, name: e.target.value }))} />
            <select className="input" required value={prodForm.categoryId} onChange={(e) => setProdForm((f) => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Категория</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="input" required type="number" min="0" placeholder="Цена" value={prodForm.price} onChange={(e) => setProdForm((f) => ({ ...f, price: e.target.value }))} />
            <input className="input" placeholder="Артикул" value={prodForm.sku} onChange={(e) => setProdForm((f) => ({ ...f, sku: e.target.value }))} />
            <select className="input" value={prodForm.isAvailable ? '1' : '0'} onChange={(e) => setProdForm((f) => ({ ...f, isAvailable: e.target.value === '1' }))}>
              <option value="1">Доступен</option>
              <option value="0">Недоступен</option>
            </select>
            <span title={!isCreateProductValid ? createProductDisabledReason : undefined} style={{ display: 'inline-block' }}>
              <button className="btn" type="submit" disabled={loading || !isCreateProductValid}>Добавить</button>
            </span>
            </form>
          </div>
        )}
        {loading && <SkeletonTable rows={5} cols={5} />}
        {error && <RetryPanel message={error} onRetry={handleRetry} />}
        {canWrite && editingProductId && (
          <form className="grid" style={{ gap: 8, gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 12 }} onSubmit={handleUpdateProduct}>
            <input className="input" required placeholder="Название" value={editProductForm.name} onChange={(e) => setEditProductForm((f) => ({ ...f, name: e.target.value }))} />
            <select className="input" required value={editProductForm.categoryId} onChange={(e) => setEditProductForm((f) => ({ ...f, categoryId: e.target.value }))}>
              <option value="">Категория</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="input" required type="number" min="0" placeholder="Цена" value={editProductForm.price} onChange={(e) => setEditProductForm((f) => ({ ...f, price: e.target.value }))} />
            <input className="input" placeholder="Артикул" value={editProductForm.sku} onChange={(e) => setEditProductForm((f) => ({ ...f, sku: e.target.value }))} />
            <select className="input" value={editProductForm.isAvailable ? '1' : '0'} onChange={(e) => setEditProductForm((f) => ({ ...f, isAvailable: e.target.value === '1' }))}>
              <option value="1">Доступен</option>
              <option value="0">Недоступен</option>
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <span title={!isEditProductValid ? editProductDisabledReason : undefined} style={{ display: 'inline-block' }}>
                <button className="btn" type="submit" disabled={loading || !isEditProductValid}>Сохранить</button>
              </span>
              <button className="btn secondary" type="button" onClick={() => setEditingProductId(null)}>Отмена</button>
            </div>
          </form>
        )}
        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <EmptyState
                title="Товаров пока нет"
                description="Добавьте первый товар в каталог"
                icon="empty"
                action={canWrite && <button className="btn secondary" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Добавить товар</button>}
              />
            ) : (
              <>
                <div className="table-wrap">
                  <table className="table">
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Категория</th>
                      <th>Цена</th>
                      <th>Доступен</th>
                      {canWrite && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{categories.find((c) => c.id === p.categoryId)?.name ?? p.categoryId}</td>
                      <td>{p.price}</td>
                        <td>{p.isAvailable ? 'Да' : 'Нет'}</td>
                        {canWrite && (
                          <td>
                            <button className="btn secondary" type="button" onClick={() => startEditProduct(p)}>Редактировать</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
                <div className="table-mobile">
                  {sortedProducts.map((p) => (
                    <div key={p.id} className="table-mobile-card">
                      <div className="table-mobile-row">
                        <div className="table-mobile-label">Название</div>
                        <div className="table-mobile-value">{p.name}</div>
                      </div>
                      <div className="table-mobile-row">
                        <div className="table-mobile-label">Категория</div>
                        <div className="table-mobile-value">{categories.find((c) => c.id === p.categoryId)?.name ?? p.categoryId}</div>
                      </div>
                      <div className="table-mobile-row">
                        <div className="table-mobile-label">Цена</div>
                        <div className="table-mobile-value">{p.price}</div>
                      </div>
                      <div className="table-mobile-row">
                        <div className="table-mobile-label">Доступен</div>
                        <div className="table-mobile-value">{p.isAvailable ? 'Да' : 'Нет'}</div>
                      </div>
                      {canWrite && (
                        <div className="table-mobile-actions">
                          <button className="btn secondary" type="button" onClick={() => startEditProduct(p)}>Редактировать</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {productsTotalPages > 1 && (
                  <Pagination
                    page={productPage}
                    totalPages={productsTotalPages}
                    total={productsTotal}
                    pageSize={productsPageSize}
                    onPageChange={setProductPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
