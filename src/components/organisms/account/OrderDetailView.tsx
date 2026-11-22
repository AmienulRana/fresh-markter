import { Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { ProductImage } from '@/components/atoms/ProductImage'
import { Skeleton } from '@/components/atoms/Skeleton'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { withQuery } from '@/lib/queries/client'
import { useMyOrder } from '@/lib/queries/commerce'
import { getErrorMessage } from '@/lib/api/errors'
import { formatDate, formatRupiah, formatWeight, paymentLabel } from '@/lib/utils'

function OrderDetailViewBase({ orderRef }: { orderRef: string }) {
  const { data: order, isPending, isError, error } = useMyOrder(orderRef)

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-40 w-full rounded-card" />
        <Skeleton className="h-72 w-full rounded-card" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <Card className="flex flex-col items-start gap-4 p-6" role="alert">
        <p className="text-sm text-danger-600">{getErrorMessage(error, 'Pesanan tidak ditemukan.')}</p>
        <Button href="/account" variant="outline" size="sm">
          Kembali ke pesanan saya
        </Button>
      </Card>
    )
  }

  const items = order.order_detail ?? []
  const subtotal = items.reduce((total, item) => total + Number(item.product_price) * Number(item.quantity), 0)
  const shipping = Number(order.shipping_fee ?? 0)

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-500">Kode pesanan</p>
            <p className="text-xl font-bold">{order.order_code}</p>
            <p className="mt-1 text-sm text-ink-500">{formatDate(order.order_datetime, true)}</p>
          </div>
          <StatusBadge status={order.order_status} />
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ink-500">Pembayaran</dt>
            <dd className="font-semibold">{paymentLabel(order.payment_method)}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Pengiriman</dt>
            <dd className="font-semibold">{order.shipping_type || (shipping > 0 ? 'Delivery' : '-')}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Total</dt>
            <dd className="font-semibold tabular-nums">{formatRupiah(order.total_amount)}</dd>
          </div>
        </dl>
        {order.remarks ? (
          <p className="mt-4 rounded-xl bg-cream-50 px-4 py-3 text-sm text-ink-700">
            <span className="font-semibold">Catatan: </span>
            {order.remarks}
          </p>
        ) : null}
      </Card>

      <Card className="overflow-hidden">
        <h2 className="border-b border-cream-200 px-6 py-4 text-base font-bold">Produk dipesan</h2>
        <ul className="divide-y divide-cream-200">
          {items.map((item, index) => (
            <li key={`${item.product_name}-${index}`} className="flex items-center gap-4 px-6 py-4">
              <ProductImage src={item.product_image} alt="" className="h-14 w-14 rounded-xl" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.product_name}</p>
                <p className="text-xs text-ink-500">
                  {item.quantity} × {formatRupiah(item.product_price)}
                  {item.weight ? ` · ${formatWeight(item.weight, item.unit)}` : ''}
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums">{formatRupiah(item.product_price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="ml-auto flex max-w-xs flex-col gap-2 border-t border-cream-200 px-6 py-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">Subtotal</dt>
            <dd className="tabular-nums">{formatRupiah(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">Ongkos kirim</dt>
            <dd className="tabular-nums">{formatRupiah(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t border-cream-200 pt-2">
            <dt className="font-bold">Total</dt>
            <dd className="font-bold tabular-nums">{formatRupiah(subtotal + shipping)}</dd>
          </div>
        </dl>
      </Card>

      {order.customer ? (
        <Card className="p-6">
          <h2 className="text-base font-bold">Dikirim ke</h2>
          <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <li className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-4 w-4 text-ink-500" />
              {order.customer.customer_name || '-'}
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-ink-500" />
              {order.customer.customer_phone || '-'}
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-ink-500" />
              <span className="break-all">{order.customer.customer_email || '-'}</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-ink-500" />
              {order.customer.customer_address || '-'}
            </li>
          </ul>
        </Card>
      ) : null}
    </div>
  )
}

export const OrderDetailView = withQuery(OrderDetailViewBase)
