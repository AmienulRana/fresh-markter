import { Receipt } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { ProductImage } from '@/components/atoms/ProductImage'
import { Select } from '@/components/atoms/Select'
import { Skeleton } from '@/components/atoms/Skeleton'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { withQuery } from '@/lib/queries/client'
import { useMyOrders } from '@/lib/queries/commerce'
import { getErrorMessage } from '@/lib/api/errors'
import { ORDER_FILTER_OPTIONS } from '@/lib/constants'
import { formatDate, formatRupiah, formatWeight } from '@/lib/utils'

function OrderHistoryBase() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const { data, isPending, isError, error, isFetching } = useMyOrders({ page, limit: 10, status: status || undefined })
  const orders = data?.items ?? []

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 p-4 sm:px-6">
        <p className="text-sm text-ink-500">
          {data ? `${data.pagination.totalCount} pesanan` : 'Memuat pesanan…'}
        </p>
        <label className="sr-only" htmlFor="order-status">
          Filter status
        </label>
        <Select
          id="order-status"
          className="w-48"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          options={ORDER_FILTER_OPTIONS}
        />
      </div>

      {isPending ? (
        <div className="flex flex-col gap-4 p-6">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState icon={<Receipt />} title="Gagal memuat pesanan" description={getErrorMessage(error)} />
      ) : !orders.length ? (
        <EmptyState
          icon={<Receipt />}
          title="Belum ada pesanan"
          description="Pesanan yang kamu buat akan muncul di sini."
          action={<Button href="/shop">Mulai belanja</Button>}
        />
      ) : (
        <div className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream-50 text-xs tracking-wide text-ink-500 uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Pesanan</th>
                  <th className="px-4 py-3 font-semibold">Tanggal</th>
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ProductImage src={order.product_image} alt="" className="h-12 w-12 rounded-xl" />
                        <div>
                          <a
                            href={`/account/orders/${encodeURIComponent(order.order_code)}`}
                            className="font-semibold hover:text-leaf-700"
                          >
                            {order.order_code}
                          </a>
                          {order.weight ? (
                            <p className="text-xs text-ink-500">{formatWeight(order.weight, order.unit)}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-ink-700">{formatDate(order.order_datetime, true)}</td>
                    <td className="px-4 py-4 text-ink-700">{order.quantity ?? '-'}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums">{formatRupiah(order.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-cream-200 md:hidden">
            {orders.map((order) => (
              <li key={order.id}>
                <a href={`/account/orders/${encodeURIComponent(order.order_code)}`} className="flex gap-3 p-4 hover:bg-cream-50">
                  <ProductImage src={order.product_image} alt="" className="h-14 w-14 rounded-xl" />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{order.order_code}</p>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-ink-500">
                      {formatDate(order.order_datetime, true)} · {order.quantity ?? '-'} item
                    </p>
                    <p className="text-sm font-bold tabular-nums">{formatRupiah(order.total_amount)}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data && orders.length ? (
        <div className="border-t border-cream-200 p-4 sm:px-6">
          <Pagination pagination={data.pagination} itemCount={orders.length} onPageChange={setPage} />
        </div>
      ) : null}
    </Card>
  )
}

export const OrderHistory = withQuery(OrderHistoryBase)
