import { atom, map } from 'nanostores'

export type PendingAction = { type: 'add-to-cart'; productId: number; quantity: number }

export const $cartDrawerOpen = atom(false)
export const $mobileNavOpen = atom(false)
export const $adminSidebarOpen = atom(false)

export const $authModal = map<{ open: boolean; redirectTo: string | null; pendingAction: PendingAction | null }>({
  open: false,
  redirectTo: null,
  pendingAction: null,
})

export const $quickViewProductId = atom<number | null>(null)

export function openCartDrawer() {
  $cartDrawerOpen.set(true)
}

export function closeCartDrawer() {
  $cartDrawerOpen.set(false)
}

export function setMobileNav(open: boolean) {
  $mobileNavOpen.set(open)
}

export function setAdminSidebar(open: boolean) {
  $adminSidebarOpen.set(open)
}

export function openAuthModal(options: { redirectTo?: string; pendingAction?: PendingAction } = {}) {
  $authModal.set({ open: true, redirectTo: options.redirectTo ?? null, pendingAction: options.pendingAction ?? null })
}

export function closeAuthModal() {
  $authModal.set({ open: false, redirectTo: null, pendingAction: null })
}

export function openQuickView(productId: number) {
  $quickViewProductId.set(productId)
}

export function closeQuickView() {
  $quickViewProductId.set(null)
}
