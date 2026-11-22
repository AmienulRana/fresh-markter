import { ExternalLink, LogOut, Menu, ShoppingBag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { SessionUser } from '@/types/user'
import { Avatar } from '@/components/atoms/Avatar'
import { NotificationBell } from '@/components/organisms/notifications/NotificationBell'
import { withQuery } from '@/lib/queries/client'
import { useSignOut } from '@/lib/queries/auth'
import { useAdminOrders } from '@/lib/queries/commerce'
import { useSessionUser } from '@/lib/hooks/useSessionUser'
import { formatDate, formatRupiah, redirectTo } from '@/lib/utils'
import { setAdminSidebar } from '@/stores/ui'

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close()
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close()
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])
  return ref
}

function PendingOrdersMenu() {
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  const { data } = useAdminOrders({ page: 1, limit: 5, status: 'PENDING' })
  const pending = data?.items ?? []
  const count = data?.pagination.totalCount ?? 0

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Pesanan menunggu, ${count}`}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-cream-100"
      >
        <ShoppingBag className="h-5 w-5" />
        {count > 0 ? (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-carrot-500 px-1 text-[0.65rem] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute top-12 right-0 z-40 w-80 animate-pop-in rounded-2xl border border-cream-200 bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-cream-200 px-4 py-3">
            <p className="text-sm font-bold">Pesanan menunggu</p>
            <a href="/dashboard/orders" className="text-xs font-semibold text-leaf-700 hover:underline">
              Lihat semua
            </a>
          </div>
          {pending.length ? (
            <ul className="max-h-80 divide-y divide-cream-200 overflow-y-auto">
              {pending.map((order) => (
                <li key={order.id}>
                  <a href={`/dashboard/orders/show/${order.id}`} className="flex flex-col px-4 py-3 hover:bg-cream-50">
                    <span className="text-sm font-semibold">
                      {order.order_code} · {order.customer_name ?? 'Pelanggan'}
                    </span>
                    <span className="text-xs text-ink-500">
                      {formatDate(order.order_datetime, true)} · {formatRupiah(order.total_amount)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-ink-500">Tidak ada pesanan yang menunggu.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

function ProfileMenu({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  const signOut = useSignOut()

  async function handleSignOut() {
    await signOut.mutateAsync().catch(() => null)
    redirectTo('/auth/signin')
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Menu profil"
        className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-cream-100"
      >
        <Avatar src={user?.photo} name={user?.name} size="sm" />
        <span className="hidden text-left sm:block">
          <span className="block text-sm leading-tight font-semibold">{user?.name}</span>
          <span className="block text-xs leading-tight text-ink-500">{user?.role}</span>
        </span>
      </button>
      {open ? (
        <div className="absolute top-12 right-0 z-40 w-56 animate-pop-in rounded-2xl border border-cream-200 bg-white p-2 shadow-pop">
          <div className="border-b border-cream-200 px-3 pt-1 pb-3">
            <p className="truncate text-sm font-bold">{user?.name}</p>
            <p className="truncate text-xs text-ink-500">{user?.email}</p>
          </div>
          <a href="/" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium hover:bg-cream-100">
            <ExternalLink className="h-4 w-4" /> Lihat toko
          </a>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-danger-600 hover:bg-danger-50"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      ) : null}
    </div>
  )
}

function AdminTopbarBase({ user: serverUser }: { user: SessionUser | null }) {
  const user = useSessionUser(serverUser)
  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-3 border-b border-cream-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-10">
      <button
        type="button"
        onClick={() => setAdminSidebar(true)}
        aria-label="Buka menu"
        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <p className="hidden text-sm text-ink-500 md:block">
        Halo, <span className="font-semibold text-ink-900">{user?.name?.split(' ')[0]}</span>. Semoga dagangan hari ini laris!
      </p>
      <div className="ml-auto flex items-center gap-2">
        <PendingOrdersMenu />
        <NotificationBell href="/dashboard/notifications" />
        <ProfileMenu user={user} />
      </div>
    </header>
  )
}

export const AdminTopbar = withQuery(AdminTopbarBase)
