import { Bell, CreditCard, LogOut, Receipt, Settings } from 'lucide-react'
import type { SessionUser } from '@/types/user'
import { Avatar } from '@/components/atoms/Avatar'
import { Card } from '@/components/atoms/Card'
import { withQuery } from '@/lib/queries/client'
import { useSignOut } from '@/lib/queries/auth'
import { useSessionUser } from '@/lib/hooks/useSessionUser'
import { cn, redirectTo } from '@/lib/utils'

const LINKS = [
  { label: 'Pesanan saya', href: '/account', icon: Receipt, match: /^\/account(\/orders(\/.*)?)?$/ },
  { label: 'Pembayaran', href: '/account/payments', icon: CreditCard, match: /^\/account\/payments(\/.*)?$/ },
  { label: 'Notifikasi', href: '/account/notifications', icon: Bell, match: /^\/account\/notifications$/ },
  { label: 'Pengaturan akun', href: '/account/setting', icon: Settings, match: /^\/account\/setting$/ },
]

function AccountNavBase({ user: serverUser, currentPath }: { user: SessionUser | null; currentPath: string }) {
  const user = useSessionUser(serverUser)
  const signOut = useSignOut()

  async function handleSignOut() {
    await signOut.mutateAsync().catch(() => null)
    redirectTo('/auth/signin')
  }

  return (
    <Card className="h-fit p-3 lg:sticky lg:top-40">
      <div className="flex items-center gap-3 border-b border-cream-200 p-3 pb-4">
        <Avatar src={user?.photo} name={user?.name} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{user?.name}</p>
          <p className="truncate text-xs text-ink-500">{user?.email}</p>
        </div>
      </div>
      <nav aria-label="Menu akun" className="flex gap-1 overflow-x-auto pt-3 lg:flex-col">
        {LINKS.map(({ label, href, icon: Icon, match }) => {
          const active = match.test(currentPath.replace(/\/$/, ''))
          return (
            <a
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors lg:flex-none',
                active ? 'bg-leaf-50 text-leaf-700' : 'text-ink-700 hover:bg-cream-100',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </a>
          )
        })}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger-600 hover:bg-danger-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </nav>
    </Card>
  )
}

export const AccountNav = withQuery(AccountNavBase)
