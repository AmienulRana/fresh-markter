import { map } from 'nanostores'
import type { ShopProductParams } from '@/types/catalog'

export interface ShopFilters {
  search: string
  category: string
  minPrice: number | null
  maxPrice: number | null
  orderBy: string
  page: number
  limit: number
}

export const DEFAULT_SHOP_FILTERS: ShopFilters = {
  search: '',
  category: '',
  minPrice: null,
  maxPrice: null,
  orderBy: '',
  page: 1,
  limit: 10,
}

function toNumber(value: string | null) {
  if (value === null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseShopFilters(params: URLSearchParams): ShopFilters {
  return {
    search: params.get('search') ?? '',
    category: params.get('category') ?? '',
    minPrice: toNumber(params.get('minPrice')),
    maxPrice: toNumber(params.get('maxPrice')),
    orderBy: params.get('orderBy') ?? '',
    page: Math.max(1, toNumber(params.get('page')) ?? 1),
    limit: toNumber(params.get('limit')) ?? DEFAULT_SHOP_FILTERS.limit,
  }
}

export function serializeShopFilters(filters: ShopFilters) {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.category) params.set('category', filters.category)
  if (filters.minPrice !== null) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice !== null) params.set('maxPrice', String(filters.maxPrice))
  if (filters.orderBy) params.set('orderBy', filters.orderBy)
  if (filters.page > 1) params.set('page', String(filters.page))
  if (filters.limit !== DEFAULT_SHOP_FILTERS.limit) params.set('limit', String(filters.limit))
  return params.toString()
}

export function toShopParams(filters: ShopFilters): ShopProductParams {
  const hasPrice = filters.minPrice !== null || filters.maxPrice !== null
  return {
    search: filters.search || undefined,
    category: filters.category || undefined,
    orderBy: filters.orderBy || undefined,
    page: filters.page,
    limit: filters.limit,
    price: hasPrice ? `${filters.minPrice ?? 0} - ${filters.maxPrice ?? 0}` : undefined,
  }
}

export const $shopFilters = map<ShopFilters>({ ...DEFAULT_SHOP_FILTERS })

function syncUrl(filters: ShopFilters) {
  if (typeof window === 'undefined') return
  const query = serializeShopFilters(filters)
  const url = `${window.location.pathname}${query ? `?${query}` : ''}`
  window.history.replaceState(null, '', url)
}

export function initShopFilters(filters: ShopFilters) {
  $shopFilters.set(filters)
}

export function updateShopFilters(patch: Partial<ShopFilters>) {
  const next = { ...$shopFilters.get(), ...patch }
  if (!('page' in patch)) next.page = 1
  $shopFilters.set(next)
  syncUrl(next)
}

export function resetShopFilters() {
  const next = { ...DEFAULT_SHOP_FILTERS, limit: $shopFilters.get().limit }
  $shopFilters.set(next)
  syncUrl(next)
}
