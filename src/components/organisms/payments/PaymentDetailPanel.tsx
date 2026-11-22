import { MapPin, UserRound } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Skeleton } from '@/components/atoms/Skeleton'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { withQuery } from '@/lib/queries/client'
import { useAdminPayment, useMyPayment } from '@/lib/queries/commerce'
import { getErrorMessage } from '@/lib/api/errors'
import { formatDate, formatRupiah, paymentLabel } from '@/lib/utils'

function PaymentDetailPanelBase({ paymentId, scope }: { paymentId: string; scope: 'admin' | 'mine' }) {
  const admin = useAdminPayment(scope === 'admin' ? paymentId : '')
  const mine = useMyPayment(scope === 'mine' ? paymentId : '')
  const { data: payment, isPending, isError, error } = scope === 'admin' ? admin : mine

  if (isPending) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Skeleton className="h-72 w-full rounded-card" />
        <Skeleton className="h-48 w-full rounded-card" />
      </div>
    )
  }

  if (isError || !payment) {
    return (
      <Card className="p-6 text-sm text-danger-600" role="alert">
        {getErrorMessage(error, 'Pembayaran tidak ditemukan.')}
      </Card>
    )
  }

  const orderHref =
    scope === 'admin'
      ? `/dashboard/orders?search=${encodeURIComponent(payment.order_code)}`
      : `/account/orders/${encodeURIComponent(payment.order_code)}`

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-500">Pembayaran untuk pesanan</p>
            <p className="text-xl font-bold">{payment.order_code || `#${payment.id}`}</p>
            <p className="mt-1 text-sm text-ink-500">Dipesan {formatDate(payment.order_at, true)}</p>
          </div>
          <StatusBadge status={payment.payment_status} />
        </div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-ink-500">Metode</dt>
            <dd className="font-semibold">{paymentLabel(payment.payment_method)}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Pengiriman</dt>
            <dd className="font-semibold">{payment.shipping_type || '-'}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Dibayar</dt>
            <dd className="font-semibold">{formatDate(payment.payment_at, true)}</dd>
          </div>
          <div>
            <dt className="text-ink-500">Jumlah</dt>
            <dd className="font-semibold tabular-nums">{formatRupiah(payment.gross_amount)}</dd>
          </div>
        </dl>
        {payment.order_remarks ? (
          <p className="mt-4 rounded-xl bg-cream-50 px-4 py-3 text-sm text-ink-700">
            <span className="font-semibold">Catatan: </span>
            {payment.order_remarks}
          </p>
        ) : null}
        {payment.order_code ? (
          <div className="mt-6 border-t border-cream-200 pt-5">
            <Button href={orderHref} variant="outline">
              Lihat pesanan
            </Button>
          </div>
        ) : null}
      </Card>

      <Card className="h-fit p-6">
        <h2 className="text-base font-bold">Pelanggan</h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm">
          <li className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-4 w-4 text-ink-500" />
            {payment.customer_name || '-'}
          </li>
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 text-ink-500" />
            {payment.customer_address || '-'}
          </li>
        </ul>
      </Card>
    </div>
  )
}

export const PaymentDetailPanel = withQuery(PaymentDetailPanelBase)
