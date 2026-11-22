import { useState } from 'react'
import type { PaymentListItem } from '@/types/order'
import { Select } from '@/components/atoms/Select'
import { RowActions } from '@/components/molecules/RowActions'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { TableSearch } from '@/components/molecules/TableSearch'
import { DataTable, type Column } from '@/components/organisms/admin/DataTable'
import { withQuery } from '@/lib/queries/client'
import { useAdminPayments } from '@/lib/queries/commerce'
import { PAYMENT_FILTER_OPTIONS } from '@/lib/constants'
import { formatRupiah, paymentLabel } from '@/lib/utils'

function PaymentTableBase() {
  const [params, setParams] = useState({ search: '', status: '', page: 1, limit: 10 })
  const { data, isPending, isFetching, error } = useAdminPayments({
    search: params.search || undefined,
    status: params.status || undefined,
    page: params.page,
    limit: params.limit,
  })

  const columns: Column<PaymentListItem>[] = [
    {
      key: 'order',
      header: 'Pesanan',
      cell: (row) => (
        <a href={`/dashboard/payments/show/${row.id}`} className="font-semibold hover:text-leaf-700">
          {row.order_code || `#${row.id}`}
        </a>
      ),
    },
    { key: 'method', header: 'Metode', cell: (row) => paymentLabel(row.payment_method) },
    { key: 'shipping', header: 'Pengiriman', cell: (row) => row.shipping_type || '-' },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.payment_status} /> },
    {
      key: 'amount',
      header: 'Jumlah',
      align: 'right',
      cell: (row) => <span className="font-semibold tabular-nums">{formatRupiah(row.gross_amount)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (row) => <RowActions label={row.order_code} viewHref={`/dashboard/payments/show/${row.id}`} />,
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={data?.items ?? []}
      rowKey={(row) => row.id}
      loading={isPending}
      fetching={isFetching}
      error={error}
      pagination={data?.pagination}
      onPageChange={(page) => setParams((current) => ({ ...current, page }))}
      emptyTitle="Belum ada pembayaran"
      toolbar={
        <>
          <TableSearch
            placeholder="Cari metode pembayaran…"
            onSearch={(search) => search !== params.search && setParams((current) => ({ ...current, search, page: 1 }))}
          />
          <Select
            aria-label="Filter status pembayaran"
            className="w-44 sm:ml-auto"
            value={params.status}
            onChange={(event) => setParams((current) => ({ ...current, status: event.target.value, page: 1 }))}
            options={PAYMENT_FILTER_OPTIONS}
          />
        </>
      }
    />
  )
}

export const PaymentTable = withQuery(PaymentTableBase)
