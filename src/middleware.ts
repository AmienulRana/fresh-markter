import { defineMiddleware } from 'astro:middleware'
import { isApiError } from '@/lib/api/errors'
import { clearSession, readSessionUser, readToken } from '@/lib/auth/cookies'
import { fetchVerifiedUser } from '@/lib/auth/session'
import { ADMIN_ROLE } from '@/lib/constants'

const PROTECTED_ROUTES = [/^\/account(\/|$)/, /^\/shop\/(cart|checkout|success-payment)(\/|$)/]
const ADMIN_ROUTES = /^\/dashboard(\/|$)/
const GUEST_ROUTES = /^\/auth\/(signin|signup)(\/|$)/

function signInRedirect(pathname: string, search: string) {
  return `/auth/signin?redirect=${encodeURIComponent(`${pathname}${search}`)}`
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context
  const token = readToken(cookies)
  let user = token ? readSessionUser(cookies) : null

  context.locals.token = token
  context.locals.user = user

  if (url.pathname.startsWith('/api/')) return next()

  const isAdminRoute = ADMIN_ROUTES.test(url.pathname)
  const isProtected = isAdminRoute || PROTECTED_ROUTES.some((pattern) => pattern.test(url.pathname))

  if (isProtected) {
    if (!token) return redirect(signInRedirect(url.pathname, url.search))
    try {
      user = await fetchVerifiedUser(cookies, token)
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        clearSession(cookies)
        return redirect(signInRedirect(url.pathname, url.search))
      }
    }
    if (!user) return redirect(signInRedirect(url.pathname, url.search))
    if (isAdminRoute && user.role !== ADMIN_ROLE) return redirect('/')
    context.locals.user = user
  }

  if (GUEST_ROUTES.test(url.pathname) && user) {
    return redirect(user.role === ADMIN_ROLE ? '/dashboard' : '/')
  }

  return next()
})
