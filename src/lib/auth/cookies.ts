import type { AstroCookies } from 'astro'
import type { SessionUser, User } from '@/types/user'

export const TOKEN_COOKIE = 'fm_token'
export const USER_COOKIE = 'fm_user'

const MAX_AGE = 60 * 60 * 24 * 7

function cookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: import.meta.env.PROD,
    maxAge: MAX_AGE,
  }
}

function extractRole(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'name' in value && typeof value.name === 'string') return value.name
  return ''
}

export function toSessionUser(user: Omit<Partial<User>, 'role'> & { role?: unknown; role_name?: unknown }): SessionUser {
  const role = extractRole(user.role) || extractRole(user.role_name)
  return {
    id: Number(user.id ?? 0),
    name: user.name ?? '',
    email: user.email ?? '',
    role,
    photo: user.photo ?? '',
  }
}

export function writeSession(cookies: AstroCookies, token: string, user: SessionUser) {
  cookies.set(TOKEN_COOKIE, token, cookieOptions())
  cookies.set(USER_COOKIE, JSON.stringify(user), cookieOptions())
}

export function updateSessionUser(cookies: AstroCookies, user: SessionUser) {
  cookies.set(USER_COOKIE, JSON.stringify(user), cookieOptions())
}

export function clearSession(cookies: AstroCookies) {
  cookies.delete(TOKEN_COOKIE, { path: '/' })
  cookies.delete(USER_COOKIE, { path: '/' })
}

export function readToken(cookies: AstroCookies) {
  return cookies.get(TOKEN_COOKIE)?.value ?? null
}

export function readSessionUser(cookies: AstroCookies): SessionUser | null {
  const raw = cookies.get(USER_COOKIE)?.value
  if (!raw) return null
  try {
    return toSessionUser(JSON.parse(raw))
  } catch {
    return null
  }
}
