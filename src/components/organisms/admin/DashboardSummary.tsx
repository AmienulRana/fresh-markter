import { Clock, List, PackageOpen, Plus, ShoppingBag, Store, Truck, Users } from 'lucide-react'
import type { SessionUser } from '@/types/user'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { StatCard } from '@/components/molecules/StatCard'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { withQuery } from '@/lib/queries/client'
import { useAdminCategories, useAdminProducts } from '@/lib/queries/catalog'
import { useAdminOrders, useCustomers } from '@/lib/queries/commerce'
import { useSessionUser } from '@/lib/hooks/useSessionUser'
import { formatDate, formatRupiah } from '@/lib/utils'

function DashboardSummaryBase({ user: serverUser }: { user: SessionUser | null }) {
  const user = useSessionUser(serverUser)
  const totalCount = { page: 1, limit: 1 }
  const products = useAdminProducts(totalCount)
  const categories = useAdminCategories(totalCount)
  const customers = useCustomers(totalCount)
  const pending = useAdminOrders({ ...totalCount, status: 'PENDING' })
  const sending = useAdminOrders({ ...totalCount, status: 'SENDING' })
  const recent = useAdminOrders({ page: 1, limit: 5 })

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-leaf-700 p-8 text-white sm:p-10">
        <div className="relative z-10 max-w-xl">
          <h2 className="font-display text-3xl font-semibold text-white">
            Selamat datang, {user?.name?.split(' ')[0] ?? 'Admin'}!
          </h2>
          <p className="mt-2 text-leaf-100">
            Kelola produk, kategori, pesanan, dan pelanggan Fresh Market dari satu tempat.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button href="/dashboard/products/create" variant="accent">
              <Plus className="h-4 w-4" /> Tambah produk
            </Button>
            <Button
              href="/dashboard/orders"
              variant="outline"
              className="border-leaf-500 bg-transparent text-white hover:border-leaf-400 hover:bg-leaf-600"
            >
              Kelola pesanan
            </Button>
          </div>
        </div>
        <svg aria-hidden viewBox="0 0 200 200" className="absolute -right-10 -bottom-16 h-64 w-64 opacity-20">
          <circle cx="100" cy="100" r="90" fill="#AFD9BD" />
          <path d="M100 30c40 10 60 45 50 85-30 0-55-25-50-85Z" fill="#2E7D4F" />
          <path d="M100 30c-40 10-60 45-50 85 30 0 55-25 50-85Z" fill="#3F9A64" />
        </svg>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Pesanan menunggu"
          value={pending.data?.pagination.totalCount ?? 0}
          icon={<Clock className="h-5 w-5" />}
          tone="sun"
          loading={pending.isPending}
          href="/dashboard/orders?status=PENDING"
        />
        <StatCard
          label="Sedang dikirim"
          value={sending.data?.pagination.totalCount ?? 0}
          icon={<Truck className="h-5 w-5" />}
          tone="info"
          loading={sending.isPending}
          href="/dashboard/orders?status=SENDING"
        />
        <StatCard
          label="Total pesanan"
          value={recent.data?.pagination.totalCount ?? 0}
          icon={<ShoppingBag className="h-5 w-5" />}
          tone="carrot"
          loading={recent.isPending}
          href="/dashboard/orders"
        />
        <StatCard
          label="Produk"
          value={products.data?.pagination.totalCount ?? 0}
          icon={<Store className="h-5 w-5" />}
          loading={products.isPending}
          href="/dashboard/products"
        />
        <StatCard
          label="Kategori"
          value={categories.data?.pagination.totalCount ?? 0}
          icon={<List className="h-5 w-5" />}
          loading={categories.isPending}
          href="/dashboard/categories"
        />
        <StatCard
          label="Pelanggan"
          value={customers.data?.pagination.totalCount ?? 0}
          icon={<Users className="h-5 w-5" />}
          loading={customers.isPending}
          href="/dashboard/customers"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4">
          <h2 className="text-base font-bold">Pesanan terbaru</h2>
          <a href="/dashboard/orders" className="text-sm font-semibold text-leaf-700 hover:underline">
            Lihat semua
          </a>
        </div>
        {recent.data?.items.length ? (
          <ul className="divide-y divide-cream-200">
            {recent.data.items.map((order) => (
              <li key={order.id}>
                <a
                  href={`/dashboard/orders/show/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 hover:bg-cream-50"
                >
                  <div>
                    <p className="text-sm font-semibold">{order.order_code}</p>
                    <p className="text-xs text-ink-500">
                      {order.customer_name ?? 'Pelanggan'} · {formatDate(order.order_datetime, true)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-semibold tabular-nums">{formatRupiah(order.total_amount)}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-ink-500">
            <PackageOpen className="h-8 w-8 text-ink-500/60" />
            {recent.isPending ? 'Memuat pesanan…' : 'Belum ada pesanan.'}
          </div>
        )}
      </Card>
    </div>
  )
}

export const DashboardSummary = withQuery(DashboardSummaryBase)
