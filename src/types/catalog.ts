import type { ListParams } from './api'

export interface Category {
  id: number
  name: string
  slug: string
  icon?: string
  description?: string
  status?: string
  parent_id?: number | null
  total_product?: number
  childs?: Category[]
}

export interface CategoryPayload {
  name: string
  description: string
  status: string
  icon: string
  parent_id: number | null
}

export interface ProductVariant {
  id: number
  weight: number
  stock: number
  reguler_price: number
  sale_price: number
  product_image?: string
  image?: string
}

export interface Product extends ProductVariant {
  product_name: string
  product_description?: string
  description?: string
  category_name?: string
  category_slug?: string
  unit: string
  product_status?: string
  created_at?: string
  child?: ProductVariant[]
}

export interface ShopProductParams extends ListParams {
  category?: string
  price?: string
}

export interface AdminProductParams extends ListParams {
  status?: string
  category?: string
  startPrice?: number
  endPrice?: number
}

export interface VariantInput {
  stock: number
  weight: number
  reguler_price: number
  sale_price: number
  product_image: string
}

export interface ProductPayload {
  product_name: string
  category_slug: string
  unit: string
  product_description: string
  status: string
  variant_detail: VariantInput[]
  variant: number
}
