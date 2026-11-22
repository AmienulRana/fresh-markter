import type { HealthStatus, ListParams, Paginated } from '@/types/api'
import type {
  AdminProductParams,
  Category,
  CategoryPayload,
  Product,
  ProductPayload,
  ShopProductParams,
} from '@/types/catalog'
import type { NotificationDetail, NotificationListItem, NotificationParams } from '@/types/notification'
import type {
  CartItem,
  CreateOrderPayload,
  CreatePaymentPayload,
  OrderDetail,
  OrderListItem,
  OrderParams,
  PaymentDetail,
  PaymentListItem,
  PaymentParams,
  PaymentResult,
  PublicOrderLookup,
} from '@/types/order'
import type {
  CustomerPayload,
  ProfilePayload,
  ResetPasswordPayload,
  Role,
  SignUpPayload,
  User,
} from '@/types/user'
import { browserRequest } from '@/lib/api/browser'
import { normalizePagination, type QueryValue, type Requester } from '@/lib/api/request'

type Query = Record<string, QueryValue>

const segment = (value: string | number) => encodeURIComponent(String(value))

function perPageQuery(params: ListParams = {}): Query {
  return {
    search: params.search,
    orderBy: params.orderBy,
    orderType: params.orderType,
    page: params.page,
    perPage: params.limit,
  }
}

function orderQuery(params: OrderParams = {}): Query {
  return { search: params.search, status: params.status, page: params.page, perPage: params.limit }
}

function paymentQuery(params: PaymentParams = {}): Query {
  return { ...perPageQuery(params), status: params.status }
}

function notificationQuery(params: NotificationParams = {}): Query {
  return { ...perPageQuery(params), status: params.status, isRead: params.isRead ? 'true' : undefined }
}

function shopProductQuery(params: ShopProductParams = {}): Query {
  return {
    search: params.search,
    category: params.category,
    price: params.price,
    orderBy: params.orderBy,
    page: params.page,
    limit: params.limit,
  }
}

function adminProductQuery(params: AdminProductParams = {}): Query {
  return {
    search: params.search,
    categorySlug: params.category,
    startPrice: params.startPrice,
    endPrice: params.endPrice,
    status: params.status,
    orderBy: params.orderBy,
    orderType: params.orderType,
    page: params.page,
    limit: params.limit,
  }
}

function customerQuery(params: ListParams = {}): Query {
  return {
    search: params.search,
    order_by: params.orderBy,
    order_type: params.orderType,
    page: params.page,
    limit: params.limit,
  }
}

export function createApi(request: Requester) {
  async function list<T>(path: string, query: Query): Promise<Paginated<T>> {
    const res = await request<T[] | null>(path, { query })
    const items = res.data ?? []
    return { items, pagination: normalizePagination(res.pagination, items.length) }
  }

  async function data<T>(promise: Promise<{ data: T }>) {
    return (await promise).data
  }

  function uploadedUrl(payload: unknown) {
    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>
      const url = record.image_url ?? record.imageUrl ?? record.url ?? record.photo
      if (typeof url === 'string') return url
    }
    return ''
  }

  return {
    system: {
      health: () => request<HealthStatus>('/health') as unknown as Promise<HealthStatus>,
      userServiceCheck: () => request<null>('/api/check'),
      adminCheck: () => request<null>('/admin/check'),
    },

    auth: {
      signUp: (payload: SignUpPayload) => request('/signup', { method: 'POST', body: payload }),
      forgotPassword: (email: string) => request('/forgot-password', { method: 'POST', body: { email } }),
      verifyAccount: (token: string) => request('/verify-account', { query: { token } }),
      resetPassword: ({ token, ...body }: ResetPasswordPayload) =>
        request('/update-password', { method: 'PUT', query: { token }, body }),
      profile: () => data(request<User>('/auth/profile')),
      updateProfile: (payload: ProfilePayload) =>
        request('/auth/profile', { method: 'PUT', body: payload }),
    },

    uploads: {
      productImage: async (file: File) => {
        const formData = new FormData()
        formData.append('image', file)
        const res = await request<unknown>('/admin/image-upload', { method: 'POST', formData })
        return uploadedUrl(res.data)
      },
      profilePhoto: async (file: File) => {
        const formData = new FormData()
        formData.append('photo', file)
        const res = await request<unknown>('/auth/profile/image-upload', { method: 'POST', formData })
        return uploadedUrl(res.data)
      },
    },

    categories: {
      home: () => data(request<Category[]>('/categories/home')).then((d) => d ?? []),
      shop: () => data(request<Category[]>('/categories/shop')).then((d) => d ?? []),
      adminList: (params?: ListParams) => list<Category>('/admin/categories', perPageQuery(params)),
      adminDetail: (id: string | number) => data(request<Category>(`/admin/categories/${segment(id)}`)),
      adminDetailBySlug: (slug: string) =>
        data(request<Category>(`/admin/categories/${segment(slug)}/slug`)),
      create: (payload: CategoryPayload) =>
        request('/admin/categories', { method: 'POST', body: payload }),
      update: (id: string | number, payload: CategoryPayload) =>
        request(`/admin/categories/${segment(id)}`, { method: 'PUT', body: payload }),
      remove: (id: string | number) =>
        request(`/admin/categories/${segment(id)}`, { method: 'DELETE' }),
    },

    products: {
      home: () => data(request<Product[]>('/products/home')).then((d) => d ?? []),
      shop: (params?: ShopProductParams) => list<Product>('/products/shop', shopProductQuery(params)),
      detail: (id: string | number) => data(request<Product>(`/products/home/${segment(id)}`)),
      adminList: (params?: AdminProductParams) =>
        list<Product>('/admin/products', adminProductQuery(params)),
      adminDetail: (id: string | number) => data(request<Product>(`/admin/products/${segment(id)}`)),
      create: (payload: ProductPayload) => request('/admin/products', { method: 'POST', body: payload }),
      update: (id: string | number, payload: ProductPayload) =>
        request(`/admin/products/${segment(id)}`, { method: 'PUT', body: payload }),
      remove: (id: string | number) => request(`/admin/products/${segment(id)}`, { method: 'DELETE' }),
    },

    cart: {
      list: () => data(request<CartItem[] | null>('/auth/cart')).then((d) => d ?? []),
      add: (productId: number, quantity: number) =>
        request('/auth/cart', { method: 'POST', body: { product_id: productId, quantity } }),
      remove: (productId: number) =>
        request('/auth/cart', { method: 'DELETE', query: { product_id: productId } }),
      clear: () => request('/auth/cart/all', { method: 'DELETE' }),
    },

    orders: {
      publicByCode: (code: string) =>
        data(request<PublicOrderLookup>(`/public/orders/${segment(code)}/code`)),
      mine: (params?: OrderParams) => list<OrderListItem>('/auth/orders', orderQuery(params)),
      mineDetail: (id: string | number) => data(request<OrderDetail>(`/auth/orders/${segment(id)}`)),
      mineByCode: (code: string) => data(request<OrderDetail>(`/auth/orders/${segment(code)}/code`)),
      create: async (payload: CreateOrderPayload, lat: string | number | null, lng: string | number | null) => {
        const res = await request<{ order_id: number }>('/auth/orders', {
          method: 'POST',
          query: { lat: lat ?? '', lng: lng ?? '' },
          body: payload,
        })
        return res.data
      },
      adminList: (params?: OrderParams) => list<OrderListItem>('/admin/orders', orderQuery(params)),
      adminDetail: (id: string | number) => data(request<OrderDetail>(`/admin/orders/${segment(id)}`)),
      updateStatus: (id: string | number, body: { status: string; remarks: string }) =>
        request(`/admin/orders/${segment(id)}/status`, { method: 'PUT', body }),
    },

    payments: {
      create: (payload: CreatePaymentPayload) =>
        data(request<PaymentResult>('/auth/payments', { method: 'POST', body: payload })),
      mine: (params?: PaymentParams) => list<PaymentListItem>('/auth/payments', paymentQuery(params)),
      mineDetail: (id: string | number) =>
        data(request<PaymentDetail>(`/auth/payments/${segment(id)}`)),
      adminList: (params?: PaymentParams) =>
        list<PaymentListItem>('/admin/payments', paymentQuery(params)),
      adminDetail: (id: string | number) =>
        data(request<PaymentDetail>(`/admin/payments/${segment(id)}`)),
    },

    notifications: {
      list: (params?: NotificationParams) =>
        list<NotificationListItem>('/auth/notifications', notificationQuery(params)),
      detail: (id: string | number) =>
        data(request<NotificationDetail>(`/auth/notifications/${segment(id)}`)),
      markAsRead: (id: string | number) =>
        request<null>(`/auth/notifications/${segment(id)}`, { method: 'PUT' }),
    },

    customers: {
      list: (params?: ListParams) => list<User>('/admin/customers', customerQuery(params)),
      detail: (id: string | number) => data(request<User>(`/admin/customers/${segment(id)}`)),
      create: (payload: CustomerPayload) => request('/admin/customers', { method: 'POST', body: payload }),
      update: (id: string | number, payload: CustomerPayload) =>
        request(`/admin/customers/${segment(id)}`, { method: 'PUT', body: payload }),
      remove: (id: string | number) => request(`/admin/customers/${segment(id)}`, { method: 'DELETE' }),
    },

    roles: {
      list: (search?: string) =>
        data(request<Role[] | null>('/admin/roles', { query: { search } })).then((d) => d ?? []),
      detail: (id: string | number) => data(request<Role>(`/admin/roles/${segment(id)}`)),
      create: (name: string) => request('/admin/roles', { method: 'POST', body: { name } }),
      update: (id: string | number, name: string) =>
        request(`/admin/roles/${segment(id)}`, { method: 'PUT', body: { name } }),
      remove: (id: string | number) => request(`/admin/roles/${segment(id)}`, { method: 'DELETE' }),
    },
  }
}

export type Api = ReturnType<typeof createApi>

export const api = createApi(browserRequest)
