import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Pagination as PaginationData } from '@/types/api'
import { cn } from '@/lib/utils'

function pageWindow(current: number, total: number) {
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)
  const result: (number | 'gap')[] = []
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push('gap')
    result.push(page)
  })
  return result
}

export function Pagination({
  pagination,
  onPageChange,
  className,
  itemCount,
}: {
  pagination: PaginationData
  onPageChange: (page: number) => void
  className?: string
  itemCount?: number
}) {
  const { page, totalPages, totalCount, perPage } = pagination
  if (totalCount === 0) return null
  const start = (page - 1) * perPage + 1
  const end = itemCount !== undefined ? start + itemCount - 1 : Math.min(page * perPage, totalCount)
  const item = 'flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors'

  return (
    <nav
      aria-label="Navigasi halaman"
      className={cn('flex flex-col items-center justify-between gap-3 sm:flex-row', className)}
    >
      <p className="text-sm text-ink-500">
        Menampilkan <span className="font-semibold text-ink-900">{start}</span>–
        <span className="font-semibold text-ink-900">{Math.max(start, end)}</span> dari{' '}
        <span className="font-semibold text-ink-900">{totalCount}</span>
      </p>
      {totalPages > 1 ? (
        <ul className="flex items-center gap-1">
          <li>
            <button
              type="button"
              className={cn(item, 'px-2 text-ink-700 hover:bg-cream-100 disabled:opacity-40')}
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </li>
          {pageWindow(page, totalPages).map((entry, index) =>
            entry === 'gap' ? (
              <li key={`gap-${index}`} className="px-1 text-ink-500">
                …
              </li>
            ) : (
              <li key={entry}>
                <button
                  type="button"
                  onClick={() => onPageChange(entry)}
                  aria-current={entry === page ? 'page' : undefined}
                  className={cn(
                    item,
                    entry === page ? 'bg-leaf-600 text-white' : 'text-ink-700 hover:bg-cream-100',
                  )}
                >
                  {entry}
                </button>
              </li>
            ),
          )}
          <li>
            <button
              type="button"
              className={cn(item, 'px-2 text-ink-700 hover:bg-cream-100 disabled:opacity-40')}
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </li>
        </ul>
      ) : null}
    </nav>
  )
}
