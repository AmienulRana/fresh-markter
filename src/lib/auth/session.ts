import type { AstroCookies } from 'astro'
import type { SessionUser, User } from '@/types/user'
import { createServerRequester } from '@/lib/api/server'
import { readSessionUser, toSessionUser, updateSessionUser } from './cookies'

export async function fetchVerifiedUser(cookies: AstroCookies, token: string): Promise<SessionUser> {
  const res = await createServerRequester(token)<User>('/auth/profile')
  const cached = readSessionUser(cookies)
  const fresh = toSessionUser(res.data ?? {})
  const merged: SessionUser = {
    id: fresh.id || cached?.id || 0,
    name: fresh.name || cached?.name || '',
    email: fresh.email || cached?.email || '',
    role: fresh.role || cached?.role || '',
    photo: fresh.photo || cached?.photo || '',
  }
  updateSessionUser(cookies, merged)
  return merged
}
