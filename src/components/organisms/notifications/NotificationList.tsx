import { Bell } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/atoms/Card'
import { Select } from '@/components/atoms/Select'
import { Skeleton } from '@/components/atoms/Skeleton'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { withQuery } from '@/lib/queries/client'
import { useNotifications, useUnreadNotifications } from '@/lib/queries/notifications'
import { getErrorMessage } from '@/lib/api/errors'
import { NOTIFICATION_FILTER_OPTIONS } from '@/lib/constants'
import { cn, formatDate } from '@/lib/utils'
import { NotificationDetailModal } from './NotificationDetailModal'

function NotificationListBase() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)
  const onlyRead = filter === 'read'
  const { data, isPending, isError, error, isFetching } = useNotifications({ page, limit: 10, isRead: onlyRead })
  const unread = useUnreadNotifications()
  const items = data?.items ?? []
  const isUnread = (id: number) => !onlyRead && Boolean(unread.data?.count) && !unread.data?.readIds.has(id)

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 p-4 sm:px-6">
        <p className="text-sm text-ink-500">
          {unread.data ? `${unread.data.count} belum dibaca` : data ? `${data.pagination.totalCount} notifikasi` : 'Memuat…'}
        </p>
        <label className="sr-only" htmlFor="notification-filter">
          Filter notifikasi
        </label>
        <Select
          id="notification-filter"
          className="w-48"
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value)
            setPage(1)
          }}
          options={NOTIFICATION_FILTER_OPTIONS}
        />
      </div>

      {isPending ? (
        <div className="flex flex-col gap-4 p-6">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState icon={<Bell />} title="Gagal memuat notifikasi" description={getErrorMessage(error)} />
      ) : !items.length ? (
        <EmptyState icon={<Bell />} title="Belum ada notifikasi" description="Kabar terbaru soal pesananmu akan muncul di sini." />
      ) : (
        <ul className={cn('divide-y divide-cream-200', isFetching && 'opacity-60 transition-opacity')}>
          {items.map((item) => {
            const fresh = isUnread(item.id)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(item.id)}
                  className="flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-cream-50 sm:px-6"
                >
                  <span
                    aria-hidden="true"
                    className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', fresh ? 'bg-carrot-500' : 'bg-transparent')}
                  />
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className={cn('text-sm', fresh ? 'font-bold' : 'font-medium text-ink-700')}>
                      {item.subject || 'Notifikasi'}
                      {fresh ? <span className="sr-only"> (belum dibaca)</span> : null}
                    </span>
                    <span className="text-xs text-ink-500">{formatDate(item.sent_at, true)}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {data && items.length ? (
        <div className="border-t border-cream-200 p-4 sm:px-6">
          <Pagination pagination={data.pagination} itemCount={items.length} onPageChange={setPage} />
        </div>
      ) : null}

      <NotificationDetailModal id={openId} onClose={() => setOpenId(null)} />
    </Card>
  )
}

export const NotificationList = withQuery(NotificationListBase)
