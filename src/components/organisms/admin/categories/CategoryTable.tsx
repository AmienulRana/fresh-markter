import { useState } from 'react'
import type { Category } from '@/types/catalog'
import { ProductImage } from '@/components/atoms/ProductImage'
import { RowActions } from '@/components/molecules/RowActions'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { TableSearch } from '@/components/molecules/TableSearch'
import { DataTable, type Column } from '@/components/organisms/admin/DataTable'
import { withQuery } from '@/lib/queries/client'
import { useAdminCategories, useDeleteCategory } from '@/lib/queries/catalog'
import { useConfirmDelete } from '@/lib/hooks/useConfirmDelete'

function CategoryTableBase() {
  const [params, setParams] = useState({ search: '', page: 1, limit: 10 })
  const { data, isPending, isFetching, error } = useAdminCategories({
    search: params.search || undefined,
    page: params.page,
    limit: params.limit,
  })
  const remove = useDeleteCategory()
  const confirmDelete = useConfirmDelete((id: number) => remove.mutateAsync(id), 'kategori')

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Kategori',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <ProductImage src={row.icon} alt="" className="h-11 w-11 rounded-xl" />
          <div>
            <a href={`/dashboard/categories/edit/${row.id}`} className="font-semibold hover:text-leaf-700">
              {row.name}
            </a>
            {row.description ? <p className="line-clamp-1 max-w-xs text-xs text-ink-500">{row.description}</p> : null}
          </div>
        </div>
      ),
    },
    { key: 'total', header: 'Jumlah produk', cell: (row) => row.total_product ?? 0 },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (row) => (
        <RowActions
          label={row.name}
          viewHref={`/shop?category=${encodeURIComponent(row.slug)}`}
          editHref={`/dashboard/categories/edit/${row.id}`}
          onDelete={() => confirmDelete(row.id, row.name)}
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
      emptyTitle="Belum ada kategori"
      toolbar={
        <TableSearch
          placeholder="Cari kategori…"
          onSearch={(search) => search !== params.search && setParams((current) => ({ ...current, search, page: 1 }))}
        />
      }
    />
  )
}

export const CategoryTable = withQuery(CategoryTableBase)
