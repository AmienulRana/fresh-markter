import { CreditCard } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Select } from '@/components/atoms/Select'
import { Skeleton } from '@/components/atoms/Skeleton'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { withQuery } from '@/lib/queries/client'
import { useMyPayments } from '@/lib/queries/commerce'
import { getErrorMessage } from '@/lib/api/errors'
import { PAYMENT_FILTER_OPTIONS } from '@/lib/constants'
import { formatRupiah, paymentLabel } from '@/lib/utils'

function PaymentHistoryBase() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const { data, isPending, isError, error, isFetching } = useMyPayments({ page, limit: 10, status: status || undefined })
  const payments = data?.items ?? []

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 p-4 sm:px-6">
        <p className="text-sm text-ink-500">
          {data ? `${data.pagination.totalCount} pembayaran` : 'Memuat pembayaran…'}
        </p>
        <label className="sr-only" htmlFor="payment-status">
          Filter status
        </label>
        <Select
          id="payment-status"
          className="w-48"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          options={PAYMENT_FILTER_OPTIONS}
        />
      </div>

      {isPending ? (
        <div className="flex flex-col gap-4 p-6">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState icon={<CreditCard />} title="Gagal memuat pembayaran" description={getErrorMessage(error)} />
      ) : !payments.length ? (
        <EmptyState
          icon={<CreditCard />}
          title="Belum ada pembayaran"
          description="Riwayat pembayaran pesananmu akan muncul di sini."
          action={<Button href="/shop">Mulai belanja</Button>}
        />
      ) : (
        <ul className={isFetching ? 'divide-y divide-cream-200 opacity-60 transition-opacity' : 'divide-y divide-cream-200'}>
          {payments.map((payment) => (
            <li key={payment.id}>
              <a
                href={`/account/payments/${payment.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 hover:bg-cream-50 sm:px-6"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{payment.order_code || `#${payment.id}`}</span>
                  <span className="text-xs text-ink-500">
                    {paymentLabel(payment.payment_method)}
                    {payment.shipping_type ? ` · ${payment.shipping_type}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={payment.payment_status} />
                  <span className="min-w-28 text-right text-sm font-bold tabular-nums">
                    {formatRupiah(payment.gross_amount)}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {data && payments.length ? (
        <div className="border-t border-cream-200 p-4 sm:px-6">
          <Pagination pagination={data.pagination} itemCount={payments.length} onPageChange={setPage} />
        </div>
      ) : null}
    </Card>
  )
}

export const PaymentHistory = withQuery(PaymentHistoryBase)
