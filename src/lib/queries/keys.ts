import type { ListParams } from '@/types/api'
import type { AdminProductParams, ShopProductParams } from '@/types/catalog'
import type { NotificationParams } from '@/types/notification'
import type { OrderParams, PaymentParams } from '@/types/order'

export const queryKeys = {
  health: ['health'] as const,
  profile: ['profile'] as const,
  categories: {
    all: ['categories'] as const,
    home: () => ['categories', 'home'] as const,
    shop: () => ['categories', 'shop'] as const,
    admin: (params: ListParams) => ['categories', 'admin', params] as const,
    adminDetail: (id: string | number) => ['categories', 'admin-detail', String(id)] as const,
    adminSlug: (slug: string) => ['categories', 'admin-slug', slug] as const,
  },
  products: {
    all: ['products'] as const,
    home: () => ['products', 'home'] as const,
    shop: (params: ShopProductParams) => ['products', 'shop', params] as const,
    detail: (id: string | number) => ['products', 'detail', String(id)] as const,
    admin: (params: AdminProductParams) => ['products', 'admin', params] as const,
    adminDetail: (id: string | number) => ['products', 'admin-detail', String(id)] as const,
  },
  cart: { all: ['cart'] as const },
  orders: {
    all: ['orders'] as const,
    mine: (params: OrderParams) => ['orders', 'mine', params] as const,
    mineDetail: (ref: string | number) => ['orders', 'mine-detail', String(ref)] as const,
    admin: (params: OrderParams) => ['orders', 'admin', params] as const,
    adminDetail: (id: string | number) => ['orders', 'admin-detail', String(id)] as const,
  },
  payments: {
    all: ['payments'] as const,
    mine: (params: PaymentParams) => ['payments', 'mine', params] as const,
    mineDetail: (id: string | number) => ['payments', 'mine-detail', String(id)] as const,
    admin: (params: PaymentParams) => ['payments', 'admin', params] as const,
    adminDetail: (id: string | number) => ['payments', 'admin-detail', String(id)] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params: NotificationParams) => ['notifications', 'list', params] as const,
    unread: () => ['notifications', 'unread'] as const,
    detail: (id: string | number) => ['notifications', 'detail', String(id)] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (params: ListParams) => ['customers', 'list', params] as const,
    detail: (id: string | number) => ['customers', 'detail', String(id)] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: (search: string) => ['roles', 'list', search] as const,
    detail: (id: string | number) => ['roles', 'detail', String(id)] as const,
  },
}
