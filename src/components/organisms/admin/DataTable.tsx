import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Pagination as PaginationData } from '@/types/api'
import { Card } from '@/components/atoms/Card'
import { Skeleton } from '@/components/atoms/Skeleton'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { getErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  fetching,
  error,
  toolbar,
  pagination,
  onPageChange,
  emptyTitle = 'Belum ada data',
  emptyDescription,
  emptyAction,
}: {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  loading?: boolean
  fetching?: boolean
  error?: unknown
  toolbar?: ReactNode
  pagination?: PaginationData
  onPageChange?: (page: number) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
}) {
  const alignClass = (align?: Column<T>['align']) =>
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

  return (
    <Card className="overflow-hidden">
      {toolbar ? <div className="flex flex-wrap items-center gap-3 border-b border-cream-200 p-4">{toolbar}</div> : null}
      <div className={cn('overflow-x-auto', fetching && !loading && 'opacity-60 transition-opacity')}>
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-cream-50 text-xs tracking-wide text-ink-500 uppercase">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn('px-4 py-3 font-semibold first:pl-6 last:pr-6', alignClass(column.align), column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {loading
              ? Array.from({ length: 5 }, (_, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-4 first:pl-6 last:pr-6">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={rowKey(row)} className="hover:bg-cream-50/70">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn('px-4 py-3 align-middle first:pl-6 last:pr-6', alignClass(column.align), column.className)}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && error ? (
          <EmptyState icon={<Inbox />} title="Gagal memuat data" description={getErrorMessage(error)} />
        ) : null}
        {!loading && !error && !rows.length ? (
          <EmptyState icon={<Inbox />} title={emptyTitle} description={emptyDescription} action={emptyAction} />
        ) : null}
      </div>
      {pagination && onPageChange && rows.length ? (
        <div className="border-t border-cream-200 px-6 py-4">
          <Pagination pagination={pagination} itemCount={rows.length} onPageChange={onPageChange} />
        </div>
      ) : null}
    </Card>
  )
}
