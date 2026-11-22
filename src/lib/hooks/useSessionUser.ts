import { useStore } from '@nanostores/react'
import type { SessionUser } from '@/types/user'
import { $session } from '@/stores/session'

export function useSessionUser(serverUser?: SessionUser | null) {
  const user = useStore($session)
  if (typeof window === 'undefined') return serverUser ?? null
  return user
}
