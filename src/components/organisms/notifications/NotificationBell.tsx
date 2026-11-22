import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNotifications, useUnreadNotifications } from '@/lib/queries/notifications'
import { cn, formatDate } from '@/lib/utils'
import { NotificationDetailModal } from './NotificationDetailModal'

export function NotificationBell({ href, className }: { href: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const [openId, setOpenId] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const unread = useUnreadNotifications()
  const recent = useNotifications({ page: 1, limit: 5 }, open)
  const count = unread.data?.count ?? 0
  const items = recent.data?.items ?? []

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function openDetail(id: number) {
    setOpen(false)
    setOpenId(id)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={count ? `Notifikasi, ${count} belum dibaca` : 'Notifikasi'}
        aria-expanded={open}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-cream-100',
          className,
        )}
      >
        <Bell className="h-5 w-5" />
        {count > 0 ? (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-carrot-500 px-1 text-[0.65rem] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute top-12 right-0 z-40 w-80 max-w-[calc(100vw-2rem)] animate-pop-in rounded-2xl border border-cream-200 bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-cream-200 px-4 py-3">
            <p className="text-sm font-bold">Notifikasi</p>
            <a href={href} className="text-xs font-semibold text-leaf-700 hover:underline">
              Lihat semua
            </a>
          </div>
          {recent.isPending ? (
            <p className="px-4 py-6 text-center text-sm text-ink-500">Memuat…</p>
          ) : items.length ? (
            <ul className="max-h-80 divide-y divide-cream-200 overflow-y-auto">
              {items.map((item) => {
                const fresh = count > 0 && !unread.data?.readIds.has(item.id)
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(item.id)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-cream-50"
                    >
                      <span
                        aria-hidden="true"
                        className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', fresh ? 'bg-carrot-500' : 'bg-transparent')}
                      />
                      <span className="flex flex-col">
                        <span className={cn('text-sm', fresh ? 'font-bold' : 'font-medium text-ink-700')}>
                          {item.subject || 'Notifikasi'}
                        </span>
                        <span className="text-xs text-ink-500">{formatDate(item.sent_at, true)}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-ink-500">Belum ada notifikasi.</p>
          )}
        </div>
      ) : null}
      <NotificationDetailModal id={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}
