import { Badge } from '@/components/atoms/Badge'
import { Skeleton } from '@/components/atoms/Skeleton'
import { Modal } from '@/components/molecules/Modal'
import { useNotification } from '@/lib/queries/notifications'
import { getErrorMessage } from '@/lib/api/errors'
import { formatDate } from '@/lib/utils'

export function NotificationDetailModal({ id, onClose }: { id: number | null; onClose: () => void }) {
  const { data, isPending, isError, error } = useNotification(id)

  return (
    <Modal open={id !== null} onClose={onClose} title={data?.subject ?? 'Notifikasi'} size="md">
      <div className="flex flex-col gap-4 px-6 py-5">
        {isPending ? (
          <>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : isError || !data ? (
          <p className="text-sm text-danger-600" role="alert">
            {getErrorMessage(error, 'Notifikasi tidak ditemukan.')}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
              <span>{formatDate(data.sent_at, true)}</span>
              {data.notification_type ? <Badge>{data.notification_type}</Badge> : null}
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-line text-ink-700">{data.message || '-'}</p>
          </>
        )}
      </div>
    </Modal>
  )
}
