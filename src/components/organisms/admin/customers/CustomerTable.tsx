import { useState } from 'react'
import type { User } from '@/types/user'
import { Avatar } from '@/components/atoms/Avatar'
import { RowActions } from '@/components/molecules/RowActions'
import { TableSearch } from '@/components/molecules/TableSearch'
import { DataTable, type Column } from '@/components/organisms/admin/DataTable'
import { withQuery } from '@/lib/queries/client'
import { useCustomers, useDeleteCustomer } from '@/lib/queries/commerce'
import { useConfirmDelete } from '@/lib/hooks/useConfirmDelete'

function CustomerTableBase() {
  const [params, setParams] = useState({ search: '', page: 1, limit: 10 })
  const { data, isPending, isFetching, error } = useCustomers({
    search: params.search || undefined,
    page: params.page,
    limit: params.limit,
  })
  const remove = useDeleteCustomer()
  const confirmDelete = useConfirmDelete((id: number) => remove.mutateAsync(id), 'pelanggan')

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nama',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.photo} name={row.name} size="sm" />
          <a href={`/dashboard/customers/edit/${row.id}`} className="font-semibold hover:text-leaf-700">
            {row.name}
          </a>
        </div>
      ),
    },
    { key: 'email', header: 'Email', cell: (row) => row.email },
    { key: 'phone', header: 'Telepon', cell: (row) => row.phone || '-' },
    {
      key: 'address',
      header: 'Alamat',
      cell: (row) => <span className="line-clamp-1 max-w-xs text-ink-700">{row.address || '-'}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (row) => (
        <RowActions
          label={row.name}
          editHref={`/dashboard/customers/edit/${row.id}`}
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
      emptyTitle="Belum ada pelanggan"
      toolbar={
        <TableSearch
          placeholder="Cari nama atau email…"
          onSearch={(search) => search !== params.search && setParams((current) => ({ ...current, search, page: 1 }))}
        />
      }
    />
  )
}

export const CustomerTable = withQuery(CustomerTableBase)
