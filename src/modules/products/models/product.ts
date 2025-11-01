export type ProductStatus = 'activated' | 'disabled'

export interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  status: ProductStatus
}

export type ProductPayload = Omit<Product, 'id'>
