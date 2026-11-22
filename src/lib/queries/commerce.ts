import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useStore } from '@nanostores/react'
import type { ListParams } from '@/types/api'
import type { CartItem, CreateOrderPayload, CreatePaymentPayload, OrderParams, PaymentParams } from '@/types/order'
import type { CustomerPayload } from '@/types/user'
import { api } from '@/lib/services'
import { $isAuthenticated } from '@/stores/session'
import { queryKeys } from './keys'

export function useCart() {
  const authenticated = useStore($isAuthenticated)
  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: api.cart.list,
    enabled: authenticated,
    staleTime: 30_000,
  })
}

export function useCartCount() {
  const { data } = useCart()
  return data?.length ?? 0
}

export function useAddToCart() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      api.cart.add(productId, quantity),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.cart.all }),
  })
}

export function useSetCartQuantity() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async ({ item, quantity }: { item: CartItem; quantity: number }) => {
      await api.cart.remove(item.id)
      try {
        await api.cart.add(item.id, quantity)
      } catch (error) {
        await api.cart.add(item.id, item.quantity).catch(() => null)
        throw error
      }
    },
    onMutate: async ({ item, quantity }) => {
      await client.cancelQueries({ queryKey: queryKeys.cart.all })
      const previous = client.getQueryData<CartItem[]>(queryKeys.cart.all)
      client.setQueryData<CartItem[]>(queryKeys.cart.all, (items) =>
        items?.map((entry) => (entry.id === item.id ? { ...entry, quantity } : entry)),
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) client.setQueryData(queryKeys.cart.all, context.previous)
    },
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.cart.all }),
  })
}

export function useRemoveFromCart() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (productId: number) => api.cart.remove(productId),
    onMutate: async (productId) => {
      await client.cancelQueries({ queryKey: queryKeys.cart.all })
      const previous = client.getQueryData<CartItem[]>(queryKeys.cart.all)
      client.setQueryData<CartItem[]>(queryKeys.cart.all, (items) => items?.filter((entry) => entry.id !== productId))
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) client.setQueryData(queryKeys.cart.all, context.previous)
    },
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.cart.all }),
  })
}

export function useClearCart() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: api.cart.clear,
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.cart.all }),
  })
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: ({
      payload,
      lat,
      lng,
    }: {
      payload: CreateOrderPayload
      lat: string | number | null
      lng: string | number | null
    }) => api.orders.create(payload, lat, lng),
  })
}

export function useCreatePayment() {
  return useMutation({ mutationFn: (payload: CreatePaymentPayload) => api.payments.create(payload) })
}

export function useMyOrders(params: OrderParams) {
  return useQuery({
    queryKey: queryKeys.orders.mine(params),
    queryFn: () => api.orders.mine(params),
    placeholderData: keepPreviousData,
  })
}

export function useMyOrder(ref: string) {
  const isNumericId = /^\d+$/.test(ref)
  return useQuery({
    queryKey: queryKeys.orders.mineDetail(ref),
    queryFn: () => (isNumericId ? api.orders.mineDetail(ref) : api.orders.mineByCode(ref)),
    enabled: Boolean(ref),
    staleTime: 0,
  })
}

export function usePublicOrderLookup() {
  return useMutation({ mutationFn: (code: string) => api.orders.publicByCode(code) })
}

export function useAdminOrders(params: OrderParams) {
  return useQuery({
    queryKey: queryKeys.orders.admin(params),
    queryFn: () => api.orders.adminList(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.adminDetail(id),
    queryFn: () => api.orders.adminDetail(id),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

export function useUpdateOrderStatus(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (body: { status: string; remarks: string }) => api.orders.updateStatus(id, body),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.orders.all }),
  })
}

export function useCustomers(params: ListParams) {
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn: () => api.customers.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => api.customers.detail(id),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

export function useSaveCustomer(id?: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: CustomerPayload) => (id ? api.customers.update(id, payload) : api.customers.create(payload)),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.customers.all }),
  })
}

export function useDeleteCustomer() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.customers.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.customers.all }),
  })
}

export function useMyPayments(params: PaymentParams) {
  return useQuery({
    queryKey: queryKeys.payments.mine(params),
    queryFn: () => api.payments.mine(params),
    placeholderData: keepPreviousData,
  })
}

export function useMyPayment(id: string) {
  return useQuery({
    queryKey: queryKeys.payments.mineDetail(id),
    queryFn: () => api.payments.mineDetail(id),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

export function useAdminPayments(params: PaymentParams) {
  return useQuery({
    queryKey: queryKeys.payments.admin(params),
    queryFn: () => api.payments.adminList(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminPayment(id: string) {
  return useQuery({
    queryKey: queryKeys.payments.adminDetail(id),
    queryFn: () => api.payments.adminDetail(id),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

export function useRoles(search = '') {
  return useQuery({
    queryKey: queryKeys.roles.list(search),
    queryFn: () => api.roles.list(search || undefined),
    placeholderData: keepPreviousData,
  })
}

export function useRole(id: string) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: () => api.roles.detail(id),
    enabled: Boolean(id),
    staleTime: 0,
  })
}

export function useSaveRole(id?: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => (id ? api.roles.update(id, name) : api.roles.create(name)),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.roles.all }),
  })
}

export function useDeleteRole() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.roles.remove(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.roles.all }),
  })
}
