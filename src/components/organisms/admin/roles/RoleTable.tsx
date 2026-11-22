import { useState } from 'react'
import type { Role } from '@/types/user'
import { Badge } from '@/components/atoms/Badge'
import { RowActions } from '@/components/molecules/RowActions'
import { TableSearch } from '@/components/molecules/TableSearch'
import { DataTable, type Column } from '@/components/organisms/admin/DataTable'
import { withQuery } from '@/lib/queries/client'
import { useDeleteRole, useRoles } from '@/lib/queries/commerce'
import { useConfirmDelete } from '@/lib/hooks/useConfirmDelete'
import { ADMIN_ROLE } from '@/lib/constants'

function RoleTableBase() {
  const [search, setSearch] = useState('')
  const { data, isPending, isFetching, error } = useRoles(search)
  const remove = useDeleteRole()
  const confirmDelete = useConfirmDelete((id: number) => remove.mutateAsync(id), 'role')

  const columns: Column<Role>[] = [
    { key: 'id', header: 'ID', cell: (row) => <span className="text-ink-500">#{row.id}</span>, className: 'w-24' },
    {
      key: 'name',
      header: 'Nama role',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <a href={`/dashboard/role/edit/${row.id}`} className="font-semibold hover:text-leaf-700">
            {row.name}
          </a>
          {row.name === ADMIN_ROLE ? <Badge tone="success">Akses dashboard</Badge> : null}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (row) =>
        row.name === ADMIN_ROLE ? null : (
          <RowActions
            label={row.name}
            editHref={`/dashboard/role/edit/${row.id}`}
            onDelete={() => confirmDelete(row.id, row.name)}
          />
        ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={data ?? []}
      rowKey={(row) => row.id}
      loading={isPending}
      fetching={isFetching}
      error={error}
      emptyTitle={search ? 'Role tidak ditemukan' : 'Belum ada role'}
      toolbar={<TableSearch placeholder="Cari role…" onSearch={(value) => value !== search && setSearch(value)} />}
    />
  )
}

export const RoleTable = withQuery(RoleTableBase)
