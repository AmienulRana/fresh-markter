import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ListParams } from '@/types/api'
import type {
  AdminProductParams,
  Category,
  CategoryPayload,
  Product,
  ProductPayload,
  ShopProductParams,
} from '@/types/catalog'
import type { Paginated } from '@/types/api'
import { api } from '@/lib/services'
import { queryKeys } from './keys'

export function useHomeCategories(initialData?: Category[]) {
  return useQuery({
    queryKey: queryKeys.categories.home(),
    queryFn: api.categories.home,
    initialData: initialData && initialData.length ? initialData : undefined,
    staleTime: 5 * 60_000,
  })
}

export function useShopCategories() {
  return useQuery({
    queryKey: queryKeys.categories.shop(),
    queryFn: api.categories.shop,
    staleTime: 5 * 60_000,
  })
}

export function useHomeProducts(initialData?: Product[]) {
  return useQuery({
    queryKey: queryKeys.products.home(),
    queryFn: api.products.home,
    initialData: initialData && initialData.length ? initialData : undefined,
  })
}

export function useShopProducts(params: ShopProductParams, initialData?: Paginated<Product> | null) {
  return useQuery({
    queryKey: queryKeys.products.shop(params),
    queryFn: () => api.products.shop(params),
    initialData: initialData ?? undefined,
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: number | string | null, initialData?: Product | null) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => api.products.detail(id as number | string),
    enabled: id !== null && id !== '',
    initialData: initialData ?? undefined,
  })
}

export function useAdminProducts(params: AdminProductParams) {
  return useQuery({
    queryKey: queryKeys.products.admin(params),
    queryFn: () => api.products.adminList(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.adminDetail(id),
    queryFn: () => api.products.adminDetail(id),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

export function useSaveProduct(id?: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) => (id ? api.products.update(id, payload) : api.products.create(payload)),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.products.all }),
  })
}

export function useDeleteProduct() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.products.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.products.all }),
  })
}

export function useAdminCategories(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.categories.admin(params),
    queryFn: () => api.categories.adminList(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.adminDetail(id),
    queryFn: () => api.categories.adminDetail(id),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

export function useAdminCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.categories.adminSlug(slug),
    queryFn: () => api.categories.adminDetailBySlug(slug),
    enabled: Boolean(slug),
  })
}

export function useSaveCategory(id?: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: CategoryPayload) =>
      id ? api.categories.update(id, payload) : api.categories.create(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.categories.all }),
  })
}

export function useDeleteCategory() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.categories.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.categories.all }),
  })
}
