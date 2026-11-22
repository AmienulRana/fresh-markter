import { atom, computed } from 'nanostores'
import type { SessionUser } from '@/types/user'
import { ADMIN_ROLE } from '@/lib/constants'

export const SESSION_SCRIPT_ID = 'fm-session'

function readInitialSession(): SessionUser | null {
  if (typeof document === 'undefined') return null
  const el = document.getElementById(SESSION_SCRIPT_ID)
  if (!el?.textContent) return null
  try {
    return JSON.parse(el.textContent) as SessionUser | null
  } catch {
    return null
  }
}

export const $session = atom<SessionUser | null>(readInitialSession())

export const $isAuthenticated = computed($session, (user) => Boolean(user))

export const $isAdmin = computed($session, (user) => user?.role === ADMIN_ROLE)

export function setSession(user: SessionUser | null) {
  $session.set(user)
}

export function patchSession(patch: Partial<SessionUser>) {
  const current = $session.get()
  if (current) $session.set({ ...current, ...patch })
}
