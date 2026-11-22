import { useStore } from '@nanostores/react'
import { Bell, CreditCard, House, LayoutDashboard, List, LogOut, ShoppingBag, Store, UserCog, Users, X } from 'lucide-react'
import { Logo } from '@/components/atoms/Logo'
import { withQuery } from '@/lib/queries/client'
import { useSignOut } from '@/lib/queries/auth'
import { cn, redirectTo } from '@/lib/utils'
import { $adminSidebarOpen, setAdminSidebar } from '@/stores/ui'

const GROUPS = [
  {
    title: 'Ringkasan',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true }],
  },
  {
    title: 'Manajemen toko',
    items: [
      { label: 'Produk', href: '/dashboard/products', icon: Store },
      { label: 'Kategori', href: '/dashboard/categories', icon: List },
      { label: 'Pesanan', href: '/dashboard/orders', icon: ShoppingBag },
      { label: 'Pembayaran', href: '/dashboard/payments', icon: CreditCard },
      { label: 'Pelanggan', href: '/dashboard/customers', icon: Users },
    ],
  },
  {
    title: 'Pengaturan',
    items: [
      { label: 'Notifikasi', href: '/dashboard/notifications', icon: Bell },
      { label: 'Role', href: '/dashboard/role', icon: UserCog },
    ],
  },
]

function AdminSidebarBase({ currentPath }: { currentPath: string }) {
  const open = useStore($adminSidebarOpen)
  const signOut = useSignOut()

  async function handleSignOut() {
    await signOut.mutateAsync().catch(() => null)
    redirectTo('/auth/signin')
  }

  function isActive(href: string, exact?: boolean) {
    const path = currentPath.replace(/\/$/, '') || '/'
    return exact ? path === href : path === href || path.startsWith(`${href}/`)
  }

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-40 animate-fade-in bg-ink-900/40 lg:hidden" onClick={() => setAdminSidebar(false)} />
      ) : null}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-68 flex-col border-r border-cream-200 bg-white transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-18 items-center justify-between px-6">
          <a href="/dashboard" aria-label="Dashboard Fresh Market">
            <Logo />
          </a>
          <button
            type="button"
            onClick={() => setAdminSidebar(false)}
            aria-label="Tutup menu"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Menu admin" className="flex-1 overflow-y-auto px-4 py-4">
          {GROUPS.map((group) => (
            <div key={group.title} className="mb-6">
              <p className="mb-2 px-3 text-xs font-bold tracking-wide text-ink-500 uppercase">{group.title}</p>
              <ul className="flex flex-col gap-1">
                {group.items.map(({ label, href, icon: Icon, ...rest }) => {
                  const active = isActive(href, 'exact' in rest ? rest.exact : false)
                  return (
                    <li key={href}>
                      <a
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                          active ? 'bg-leaf-600 text-white' : 'text-ink-700 hover:bg-cream-100',
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" />
                        {label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t border-cream-200 p-4">
          <a
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-cream-100"
          >
            <House className="h-4.5 w-4.5" /> Lihat toko
          </a>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger-600 hover:bg-danger-50"
          >
            <LogOut className="h-4.5 w-4.5" /> Keluar
          </button>
        </div>
      </aside>
    </>
  )
}

export const AdminSidebar = withQuery(AdminSidebarBase)
