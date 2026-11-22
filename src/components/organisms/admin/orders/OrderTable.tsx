import { useState } from 'react'
import type { OrderListItem } from '@/types/order'
import { ProductImage } from '@/components/atoms/ProductImage'
import { Select } from '@/components/atoms/Select'
import { RowActions } from '@/components/molecules/RowActions'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { TableSearch } from '@/components/molecules/TableSearch'
import { DataTable, type Column } from '@/components/organisms/admin/DataTable'
import { withQuery } from '@/lib/queries/client'
import { useAdminOrders } from '@/lib/queries/commerce'
import { ORDER_FILTER_OPTIONS } from '@/lib/constants'
import { formatDate, formatRupiah, paymentLabel } from '@/lib/utils'

function OrderTableBase({ initialStatus = '', initialSearch = '' }: { initialStatus?: string; initialSearch?: string }) {
  const [params, setParams] = useState({ search: initialSearch, status: initialStatus, page: 1, limit: 10 })
  const { data, isPending, isFetching, error } = useAdminOrders({
    search: params.search || undefined,
    status: params.status || undefined,
    page: params.page,
    limit: params.limit,
  })

  const columns: Column<OrderListItem>[] = [
    {
      key: 'order',
      header: 'Pesanan',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <ProductImage src={row.product_image} alt="" className="h-11 w-11 rounded-xl" />
          <a href={`/dashboard/orders/show/${row.id}`} className="font-semibold hover:text-leaf-700">
            {row.order_code}
          </a>
        </div>
      ),
    },
    { key: 'customer', header: 'Pelanggan', cell: (row) => row.customer_name ?? '-' },
    { key: 'date', header: 'Tanggal', cell: (row) => formatDate(row.order_datetime, true) },
    { key: 'payment', header: 'Pembayaran', cell: (row) => paymentLabel(row.payment_method) },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'amount',
      header: 'Total',
      align: 'right',
      cell: (row) => <span className="font-semibold tabular-nums">{formatRupiah(row.total_amount)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (row) => <RowActions label={row.order_code} viewHref={`/dashboard/orders/show/${row.id}`} />,
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
      emptyTitle="Belum ada pesanan"
      toolbar={
        <>
          <TableSearch
            placeholder="Cari kode pesanan…"
            defaultValue={initialSearch}
            onSearch={(search) => search !== params.search && setParams((current) => ({ ...current, search, page: 1 }))}
          />
          <Select
            aria-label="Filter status"
            className="w-44 sm:ml-auto"
            value={params.status}
            onChange={(event) => setParams((current) => ({ ...current, status: event.target.value, page: 1 }))}
            options={ORDER_FILTER_OPTIONS}
          />
        </>
      }
    />
  )
}

export const OrderTable = withQuery(OrderTableBase)
