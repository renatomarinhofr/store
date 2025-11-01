import { test, expect, type Page } from '@playwright/test'

type ProductStatus = 'activated' | 'disabled'

interface Product {
  id: number
  name: string
  price: number
  description: string
  image: string
  status: ProductStatus
}

const ADMIN_PRODUCTS_ENDPOINT = '**/admin/products**'
const TENANT_PRODUCTS_ENDPOINT = '**/tenant/products**'

const ADMIN_USER = {
  email: 'admin@test.com',
  role: 'admin',
  token: 'admin-token',
  providerToken: 'provider-token',
}

const TENANT_USER = {
  email: 'tenant@test.com',
  role: 'tenant',
  token: 'tenant-token',
  providerToken: 'provider-token',
}

const ADMIN_PRODUCTS_FIXTURE: readonly Product[] = [
  {
    id: 1,
    name: 'Notebook',
    price: 3500,
    description: 'Notebook de alta performance',
    image: '',
    status: 'activated',
  },
  {
    id: 2,
    name: 'Monitor',
    price: 1500,
    description: 'Monitor 4K com HDR',
    image: '',
    status: 'disabled',
  },
]

const TENANT_PRODUCTS_FIXTURE: readonly Product[] = [
  {
    id: 1,
    name: 'Mouse',
    price: 150,
    description: 'Mouse sem fio',
    image: '',
    status: 'activated',
  },
  {
    id: 2,
    name: 'Teclado',
    price: 250,
    description: 'Teclado mecânico',
    image: '',
    status: 'disabled',
  },
]

async function seedAuthenticatedUser(page: Page, user: typeof ADMIN_USER | typeof TENANT_USER) {
  await page.addInitScript((session) => {
    window.localStorage.clear()
    window.localStorage.setItem('store.auth.user', JSON.stringify(session))
    window.localStorage.setItem('store.e2e.autoConfirmDelete', 'true')
  }, user)
}

async function mockAdminProductsApi(page: Page, products: Product[]) {
  let nextId = Math.max(0, ...products.map((product) => product.id)) + 1

  await page.route(ADMIN_PRODUCTS_ENDPOINT, async (route) => {
    const request = route.request()
    const method = request.method()
    const url = new URL(request.url())
    const pathSegments = url.pathname.split('/')
    const maybeId = pathSegments[pathSegments.length - 1]
    const isCollectionEndpoint = maybeId === 'products' || maybeId === ''
    const productId = isCollectionEndpoint ? null : Number(maybeId)

    if (method === 'OPTIONS') {
      await route.fulfill({ status: 204 })
      return
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      })
      return
    }

    if (method === 'POST') {
      const payload = JSON.parse(request.postData() ?? '{}') as Omit<Product, 'id'>
      const created: Product = {
        ...payload,
        id: nextId++,
        status: payload.status ?? 'activated',
      }
      products.push(created)
      await route.fulfill({
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      })
      return
    }

    if (productId == null || Number.isNaN(productId)) {
      await route.fulfill({ status: 400, body: 'Missing product id' })
      return
    }

    const existingIndex = products.findIndex((product) => product.id === productId)
    const existingProduct = existingIndex >= 0 ? products[existingIndex] : null

    if (!existingProduct) {
      await route.fulfill({ status: 404, body: 'Not found' })
      return
    }

    if (method === 'PUT') {
      const payload = JSON.parse(request.postData() ?? '{}') as Partial<Product>
      const updated: Product = { ...existingProduct, ...payload, id: existingProduct.id }
      products.splice(existingIndex, 1, updated)
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      return
    }

    if (method === 'PATCH') {
      const payload = JSON.parse(request.postData() ?? '{}') as Partial<Product>
      const updated: Product = { ...existingProduct, ...payload, id: existingProduct.id }
      products.splice(existingIndex, 1, updated)
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      return
    }

    if (method === 'DELETE') {
      products.splice(existingIndex, 1)
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      return
    }

    await route.continue()
  })
}

async function mockTenantProductsApi(
  page: Page,
  products: Product[],
  trackers: { patchCalled: boolean; deleteCalled: boolean },
) {
  let nextId = Math.max(0, ...products.map((product) => product.id)) + 1

  await page.route(TENANT_PRODUCTS_ENDPOINT, async (route) => {
    const request = route.request()
    const method = request.method()
    const url = new URL(request.url())
    const pathSegments = url.pathname.split('/')
    const maybeId = pathSegments[pathSegments.length - 1]
    const isCollectionEndpoint = maybeId === 'products' || maybeId === ''
    const productId = isCollectionEndpoint ? null : Number(maybeId)

    if (method === 'OPTIONS') {
      await route.fulfill({ status: 204 })
      return
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      })
      return
    }

    if (method === 'POST') {
      const payload = JSON.parse(request.postData() ?? '{}') as Omit<Product, 'id'>
      const created: Product = {
        ...payload,
        id: nextId++,
        status: payload.status ?? 'activated',
      }
      products.push(created)
      await route.fulfill({
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      })
      return
    }

    if (productId == null || Number.isNaN(productId)) {
      await route.fulfill({ status: 400, body: 'Missing product id' })
      return
    }

    const existingIndex = products.findIndex((product) => product.id === productId)
    const existingProduct = existingIndex >= 0 ? products[existingIndex] : null

    if (!existingProduct) {
      await route.fulfill({ status: 404, body: 'Not found' })
      return
    }

    if (method === 'PUT') {
      const payload = JSON.parse(request.postData() ?? '{}') as Partial<Product>
      const updated: Product = { ...existingProduct, ...payload, id: existingProduct.id }
      products.splice(existingIndex, 1, updated)
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      return
    }

    if (method === 'PATCH') {
      trackers.patchCalled = true
      await route.fulfill({ status: 403, body: 'Forbidden' })
      return
    }

    if (method === 'DELETE') {
      trackers.deleteCalled = true
      await route.fulfill({ status: 403, body: 'Forbidden' })
      return
    }

    await route.continue()
  })
}

test.describe('Products page - admin', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedUser(page, ADMIN_USER)
  })

  test('allows full management of products including status and deletion', async ({ page }) => {
    const adminProducts = ADMIN_PRODUCTS_FIXTURE.map((product) => ({ ...product }))
    await mockAdminProductsApi(page, adminProducts)

    await page.goto('/produtos')
    await page.waitForResponse(
      (response) =>
        response.url().includes('/admin/products') && response.request().method() === 'GET',
    )

    await expect(page.getByRole('heading', { name: 'Produtos' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Novo Produto' })).toBeVisible()
    const tableRows = page.locator('.p-datatable tbody tr')
    await expect(tableRows).toHaveCount(adminProducts.length)

    const notebookRow = tableRows.filter({ hasText: 'Notebook' })
    await expect(notebookRow).toHaveCount(1)
    await expect(
      notebookRow.getByRole('button', { name: 'Editar Notebook', exact: true }),
    ).toBeVisible()
    await expect(
      notebookRow.getByRole('button', { name: 'Excluir Notebook', exact: true }),
    ).toBeVisible()
    await expect(
      notebookRow.locator('[aria-label="Alternar status de Notebook"]'),
    ).toBeVisible()

    // Create product
    await page.getByRole('button', { name: 'Novo Produto' }).click()
    await expect(page.getByRole('dialog', { name: 'Novo produto' })).toBeVisible()

    await page.fill('#product-name', 'Cadeira Gamer')
    await page.fill('#product-price-input', '1999')
    await page.fill('#product-image', 'https://example.com/cadeira.png')
    await page.fill('#product-description', 'Cadeira ergonômica para escritório')

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/admin/products') && response.request().method() === 'POST',
      ),
      page.getByRole('button', { name: 'Salvar' }).click(),
    ])

    await page.waitForResponse(
      (response) =>
        response.url().includes('/admin/products') && response.request().method() === 'GET',
    )

    const createdRow = page.locator('.p-datatable tbody tr').filter({ hasText: 'Cadeira Gamer' })
    await expect(createdRow).toHaveCount(1)

    // Edit product
    await createdRow.getByRole('button', { name: 'Editar Cadeira Gamer' }).click()
    await expect(page.getByRole('dialog', { name: 'Editar produto' })).toBeVisible()

    await page.fill('#product-name', 'Cadeira Gamer X')

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/admin/products/') && response.request().method() === 'PUT',
      ),
      page.getByRole('button', { name: 'Salvar' }).click(),
    ])

    await page.waitForResponse(
      (response) =>
        response.url().includes('/admin/products') && response.request().method() === 'GET',
    )

    const updatedRow = page.locator('.p-datatable tbody tr').filter({ hasText: 'Cadeira Gamer X' })
    await expect(updatedRow).toHaveCount(1)

    // Toggle status to disabled
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/admin/products/') && response.request().method() === 'PATCH' &&
          response.request().postData()?.includes('disabled'),
      ),
      page.getByRole('switch', { name: 'Alternar status de Cadeira Gamer X' }).click(),
    ])

    await page.waitForResponse(
      (response) =>
        response.url().includes('/admin/products') && response.request().method() === 'GET',
    )

    await expect(updatedRow.getByText('Inativo')).toBeVisible()

    // Shelf interactions
    await page.getByRole('tab', { name: 'Prateleira' }).click()

    const inactiveColumn = page.getByTestId('products-shelf-disabled')
    const inactiveCard = inactiveColumn
      .getByTestId('products-shelf-card')
      .filter({ hasText: 'Cadeira Gamer X' })

    await expect(inactiveCard).toBeVisible()

    await inactiveCard.click({ button: 'right' })
    await expect(page.getByRole('menuitem', { name: 'Editar' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Excluir' })).toBeVisible()
    await page.keyboard.press('Escape')

    await inactiveCard.dragTo(page.getByTestId('products-shelf-activated'))

    const activeColumn = page.getByTestId('products-shelf-activated')
    await expect(activeColumn.getByText('Cadeira Gamer X')).toBeVisible()

    await page.getByRole('tab', { name: 'Tabela' }).click()

    await expect(updatedRow.getByText('Ativo')).toBeVisible()

    // Delete product via confirmation dialog
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/admin/products/') && response.request().method() === 'DELETE',
      ),
      updatedRow.getByRole('button', { name: 'Excluir Cadeira Gamer X' }).click(),
    ])

    await page.waitForResponse(
      (response) =>
        response.url().includes('/admin/products') && response.request().method() === 'GET',
    )

    await expect(page.locator('.p-datatable tbody tr').filter({ hasText: 'Cadeira Gamer X' })).toHaveCount(0)
    await expect(page.locator('.p-datatable tbody tr').filter({ hasText: 'Notebook' })).toHaveCount(1)
  })
})

test.describe('Products page - tenant', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuthenticatedUser(page, TENANT_USER)
  })

  test('hides admin-only actions but allows tenant CRUD operations', async ({ page }) => {
    const tenantProducts = TENANT_PRODUCTS_FIXTURE.map((product) => ({ ...product }))
    const trackers = { patchCalled: false, deleteCalled: false }
    await mockTenantProductsApi(page, tenantProducts, trackers)

    await page.goto('/produtos')
    await page.waitForResponse(
      (response) =>
        response.url().includes('/tenant/products') && response.request().method() === 'GET',
    )

    const mouseRow = page.locator('.p-datatable tbody tr').filter({ hasText: 'Mouse' })
    await expect(mouseRow.getByRole('button', { name: 'Editar Mouse' })).toBeVisible()
    await expect(mouseRow.getByRole('button', { name: 'Excluir Mouse' })).toHaveCount(0)
    await expect(
      page.getByRole('switch', { name: 'Alternar status de Mouse' }),
    ).toHaveCount(0)

    // Create
    await page.getByRole('button', { name: 'Novo Produto' }).click()
    await expect(page.getByRole('dialog', { name: 'Novo produto' })).toBeVisible()

    await page.fill('#product-name', 'Fone de Ouvido')
    await page.fill('#product-price-input', '499')
    await page.fill('#product-image', 'https://example.com/headset.png')
    await page.fill('#product-description', 'Headset intra-auricular')

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/tenant/products') && response.request().method() === 'POST',
      ),
      page.getByRole('button', { name: 'Salvar' }).click(),
    ])

    await page.waitForResponse(
      (response) =>
        response.url().includes('/tenant/products') && response.request().method() === 'GET',
    )

    const createdRow = page.locator('.p-datatable tbody tr').filter({ hasText: 'Fone de Ouvido' })
    await expect(createdRow).toHaveCount(1)

    // Edit
    await createdRow.getByRole('button', { name: 'Editar Fone de Ouvido' }).click()
    await expect(page.getByRole('dialog', { name: 'Editar produto' })).toBeVisible()

    await page.fill('#product-name', 'Fone de Ouvido Bluetooth')

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/tenant/products/') && response.request().method() === 'PUT',
      ),
      page.getByRole('button', { name: 'Salvar' }).click(),
    ])

    await page.waitForResponse(
      (response) =>
        response.url().includes('/tenant/products') && response.request().method() === 'GET',
    )

    const updatedRow = page
      .locator('.p-datatable tbody tr')
      .filter({ hasText: 'Fone de Ouvido Bluetooth' })
    await expect(updatedRow).toHaveCount(1)

    // Shelf restrictions
    await page.getByRole('tab', { name: 'Prateleira' }).click()

    const shelfCard = page
      .getByTestId('products-shelf-card')
      .filter({ hasText: 'Fone de Ouvido Bluetooth' })

    await expect(shelfCard).toBeVisible()
    await expect(shelfCard).toHaveAttribute('draggable', 'false')

    await shelfCard.click({ button: 'right' })
    await expect(page.getByRole('menuitem', { name: 'Editar' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Excluir' })).toHaveCount(0)
    await page.keyboard.press('Escape')

    expect(trackers.patchCalled).toBe(false)
    expect(trackers.deleteCalled).toBe(false)
  })
})
