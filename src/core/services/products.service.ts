import type { Product, ProductPayload, ProductStatus } from '@/modules/products/models/product'

import { httpClient } from './httpClient'

const RESOURCE_PATH = '/products'

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await httpClient.get<Product[]>(RESOURCE_PATH)
  return data
}

export async function fetchProduct(id: number): Promise<Product> {
  const { data } = await httpClient.get<Product>(`${RESOURCE_PATH}/${id}`)
  return data
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await httpClient.post<Product>(RESOURCE_PATH, payload)
  return data
}

export async function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  const { data } = await httpClient.put<Product>(`${RESOURCE_PATH}/${id}`, payload)
  return data
}

export async function deleteProduct(id: number): Promise<void> {
  await httpClient.delete(`${RESOURCE_PATH}/${id}`)
}

export async function updateProductStatus(id: number, status: ProductStatus): Promise<Product> {
  const { data } = await httpClient.patch<Product>(`${RESOURCE_PATH}/${id}`, { status })
  return data
}
