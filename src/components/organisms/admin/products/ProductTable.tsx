import { useState } from 'react'
import type { Product } from '@/types/catalog'
import { ProductImage } from '@/components/atoms/ProductImage'
import { Select } from '@/components/atoms/Select'
import { PriceTag } from '@/components/molecules/PriceTag'
import { RowActions } from '@/components/molecules/RowActions'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { TableSearch } from '@/components/molecules/TableSearch'
import { DataTable, type Column } from '@/components/organisms/admin/DataTable'
import { withQuery } from '@/lib/queries/client'
import { useAdminCategories, useAdminProducts, useDeleteProduct } from '@/lib/queries/catalog'
import { useConfirmDelete } from '@/lib/hooks/useConfirmDelete'
import { PAGE_SIZES, PRODUCT_FILTER_OPTIONS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

function ProductTableBase() {
  const [params, setParams] = useState({ search: '', status: '', category: '', page: 1, limit: 10 })
  const { data, isPending, isFetching, error } = useAdminProducts({
    search: params.search || undefined,
    status: params.status || undefined,
    category: params.category || undefined,
    page: params.page,
    limit: params.limit,
  })
  const { data: categories } = useAdminCategories({ page: 1, limit: 100 })
  const remove = useDeleteProduct()
  const confirmDelete = useConfirmDelete((id: number) => remove.mutateAsync(id), 'produk')

  function update(patch: Partial<typeof params>) {
    setParams((current) => ({ ...current, page: 1, ...patch }))
  }

  const columns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Produk',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <ProductImage src={row.product_image} alt="" className="h-12 w-12 rounded-xl" />
          <div className="min-w-0">
            <a href={`/dashboard/products/edit/${row.id}`} className="font-semibold hover:text-leaf-700">
              {row.product_name}
            </a>
            {row.child?.length ? <p className="text-xs text-ink-500">{row.child.length + 1} varian</p> : null}
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Kategori', cell: (row) => row.category_name ?? '-' },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.product_status} /> },
    {
      key: 'price',
      header: 'Harga',
      cell: (row) => <PriceTag regular={row.reguler_price} sale={row.sale_price} size="sm" />,
    },
    { key: 'created', header: 'Dibuat', cell: (row) => formatDate(row.created_at) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (row) => (
        <RowActions
          label={row.product_name}
          viewHref={`/shop/${row.id}`}
          editHref={`/dashboard/products/edit/${row.id}`}
          onDelete={() => confirmDelete(row.id, row.product_name)}
        />
      ),
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
      emptyTitle="Belum ada produk"
      emptyDescription="Tambahkan produk pertama untuk mulai berjualan."
      toolbar={
        <>
          <TableSearch placeholder="Cari nama produk…" onSearch={(search) => search !== params.search && update({ search })} />
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <Select
              aria-label="Filter kategori"
              className="w-44"
              value={params.category}
              onChange={(event) => update({ category: event.target.value })}
              placeholder="Semua kategori"
              options={(categories?.items ?? []).map((category) => ({ value: category.slug, label: category.name }))}
            />
            <Select
              aria-label="Filter status"
              className="w-40"
              value={params.status}
              onChange={(event) => update({ status: event.target.value })}
              options={PRODUCT_FILTER_OPTIONS}
            />
            <Select
              aria-label="Jumlah per halaman"
              className="w-28"
              value={params.limit}
              onChange={(event) => update({ limit: Number(event.target.value) })}
              options={PAGE_SIZES.map((size) => ({ value: size, label: `${size} / hal` }))}
            />
          </div>
        </>
      }
    />
  )
}

export const ProductTable = withQuery(ProductTableBase)
