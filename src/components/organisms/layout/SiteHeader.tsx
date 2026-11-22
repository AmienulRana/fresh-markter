import { useStore } from '@nanostores/react'
import {
  Bell,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  ShoppingBasket,
  Truck,
  UserRound,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Category } from '@/types/catalog'
import type { SessionUser } from '@/types/user'
import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { Logo } from '@/components/atoms/Logo'
import { ProductImage } from '@/components/atoms/ProductImage'
import { Drawer } from '@/components/molecules/Modal'
import { SearchBar } from '@/components/molecules/SearchBar'
import { AuthModal } from '@/components/organisms/auth/AuthModal'
import { CartDrawer } from '@/components/organisms/cart/CartDrawer'
import { NotificationBell } from '@/components/organisms/notifications/NotificationBell'
import { QuickViewModal } from '@/components/organisms/product/QuickViewModal'
import { withQuery } from '@/lib/queries/client'
import { useSignOut } from '@/lib/queries/auth'
import { useHomeCategories } from '@/lib/queries/catalog'
import { useCartCount } from '@/lib/queries/commerce'
import { useSessionUser } from '@/lib/hooks/useSessionUser'
import { ADMIN_ROLE, SHIPPING_FEE } from '@/lib/constants'
import { cn, formatRupiah, redirectTo } from '@/lib/utils'
import { $mobileNavOpen, openAuthModal, openCartDrawer, setMobileNav } from '@/stores/ui'

const NAV_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Belanja', href: '/shop' },
  { label: 'Lacak pesanan', href: '/track-order' },
]

function useClickOutside(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const handle = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose()
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('mousedown', handle)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])
  return ref
}

function goToSearch(value: string) {
  redirectTo(value ? `/shop?search=${encodeURIComponent(value)}` : '/shop')
}

function CategoryMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(open, () => setOpen(false))
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-leaf-600 px-4 text-sm font-semibold text-white hover:bg-leaf-700"
      >
        <Menu className="h-4 w-4" />
        Semua kategori
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open ? (
        <div className="absolute top-12 left-0 z-40 w-72 animate-pop-in rounded-2xl border border-cream-200 bg-white p-2 shadow-pop">
          {categories.length ? (
            <ul className="max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <li key={category.id}>
                  <a
                    href={`/shop?category=${encodeURIComponent(category.slug)}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium hover:bg-leaf-50 hover:text-leaf-700"
                  >
                    <ProductImage src={category.icon} alt="" className="h-8 w-8 rounded-lg" />
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-4 text-sm text-ink-500">Kategori belum tersedia.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

function AccountMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(open, () => setOpen(false))
  const signOut = useSignOut()

  async function handleSignOut() {
    await signOut.mutateAsync().catch(() => null)
    redirectTo('/auth/signin')
  }

  const item = 'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium hover:bg-cream-100'
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Menu akun"
        className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-cream-100"
      >
        <Avatar src={user.photo} name={user.name} size="sm" />
        <span className="hidden max-w-28 truncate text-sm font-semibold lg:block">{user.name.split(' ')[0]}</span>
        <ChevronDown className="hidden h-4 w-4 text-ink-500 lg:block" />
      </button>
      {open ? (
        <div className="absolute top-12 right-0 z-40 w-60 animate-pop-in rounded-2xl border border-cream-200 bg-white p-2 shadow-pop">
          <div className="border-b border-cream-200 px-3 pt-1 pb-3">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="truncate text-xs text-ink-500">{user.email}</p>
          </div>
          <div className="pt-2">
            {user.role === ADMIN_ROLE ? (
              <a href="/dashboard" className={item}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard admin
              </a>
            ) : null}
            <a href="/account" className={item}>
              <Receipt className="h-4 w-4" /> Pesanan saya
            </a>
            <a href="/account/payments" className={item}>
              <CreditCard className="h-4 w-4" /> Pembayaran
            </a>
            <a href="/account/notifications" className={item}>
              <Bell className="h-4 w-4" /> Notifikasi
            </a>
            <a href="/account/setting" className={item}>
              <Settings className="h-4 w-4" /> Pengaturan akun
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className={cn(item, 'w-full text-danger-600 hover:bg-danger-50')}
            >
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SiteHeaderBase({
  user: serverUser,
  categories: initialCategories,
  currentPath,
  search,
}: {
  user: SessionUser | null
  categories?: Category[]
  currentPath: string
  search?: string
}) {
  const user = useSessionUser(serverUser)
  const { data: categories = initialCategories ?? [] } = useHomeCategories(initialCategories)
  const cartCount = useCartCount()
  const mobileOpen = useStore($mobileNavOpen)

  function handleCart() {
    if (!user) {
      openAuthModal({ redirectTo: '/shop/cart' })
      return
    }
    openCartDrawer()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-cream-200 bg-white/95 backdrop-blur">
      <div className="hidden bg-leaf-800 text-leaf-100 sm:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5" />
            Pesan pagi, sampai hari ini · Ongkir flat {formatRupiah(SHIPPING_FEE)}
          </p>
          <p>Segar dari pasar, sampai di depan pintu.</p>
        </div>
      </div>

      <div className="container-page flex h-18 items-center gap-3 lg:gap-8">
        <button
          type="button"
          onClick={() => setMobileNav(true)}
          aria-label="Buka menu"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <a href="/" aria-label="Fresh Market, ke beranda" className="shrink-0">
          <Logo />
        </a>
        <SearchBar defaultValue={search} onSearch={goToSearch} className="hidden max-w-xl flex-1 md:block" />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <NotificationBell href="/account/notifications" />
              <AccountMenu user={user} />
            </>
          ) : (
            <Button href="/auth/signin" variant="ghost" size="sm" className="gap-2">
              <UserRound className="h-5 w-5" />
              <span className="hidden sm:inline">Masuk</span>
            </Button>
          )}
          <button
            type="button"
            onClick={handleCart}
            aria-label={`Keranjang, ${cartCount} produk`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-leaf-50 text-leaf-700 hover:bg-leaf-100"
          >
            <ShoppingBasket className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-carrot-500 px-1 text-[0.7rem] font-bold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="container-page pb-3 md:hidden">
        <SearchBar defaultValue={search} onSearch={goToSearch} />
      </div>

      <nav aria-label="Navigasi utama" className="hidden border-t border-cream-200 lg:block">
        <div className="container-page flex h-14 items-center gap-6">
          <CategoryMenu categories={categories} />
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={currentPath === link.href ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold hover:bg-cream-100',
                    currentPath === link.href ? 'text-leaf-700' : 'text-ink-700',
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
            {categories.slice(0, 4).map((category) => (
              <li key={category.id}>
                <a
                  href={`/shop?category=${encodeURIComponent(category.slug)}`}
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink-700 hover:bg-cream-100"
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
          {user ? (
            <a href="/account" className="ml-auto text-sm font-semibold text-ink-700 hover:text-leaf-700">
              Pesanan saya
            </a>
          ) : null}
        </div>
      </nav>

      <Drawer open={mobileOpen} onClose={() => setMobileNav(false)} title="Menu" side="left">
        <div className="flex flex-col gap-6 p-5">
          <ul className="flex flex-col gap-1">
            {[...NAV_LINKS, ...(user ? [{ label: 'Pesanan saya', href: '/account' }] : [])].map((link) => (
              <li key={link.href}>
                <a href={link.href} className="block rounded-xl px-3 py-2.5 font-semibold hover:bg-cream-100">
                  {link.label}
                </a>
              </li>
            ))}
            {user?.role === ADMIN_ROLE ? (
              <li>
                <a href="/dashboard" className="block rounded-xl px-3 py-2.5 font-semibold hover:bg-cream-100">
                  Dashboard admin
                </a>
              </li>
            ) : null}
          </ul>
          <div>
            <p className="mb-2 px-3 text-xs font-bold tracking-wide text-ink-500 uppercase">Kategori</p>
            <ul className="flex flex-col gap-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <a
                    href={`/shop?category=${encodeURIComponent(category.slug)}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-cream-100"
                  >
                    <ProductImage src={category.icon} alt="" className="h-8 w-8 rounded-lg" />
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Drawer>

      <CartDrawer />
      <AuthModal />
      <QuickViewModal />
    </header>
  )
}

export const SiteHeader = withQuery(SiteHeaderBase)
