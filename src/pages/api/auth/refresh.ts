import type { APIRoute } from 'astro'
import { isApiError } from '@/lib/api/errors'
import { clearSession, readToken } from '@/lib/auth/cookies'
import { fetchVerifiedUser } from '@/lib/auth/session'

export const POST: APIRoute = async ({ cookies }) => {
  const token = readToken(cookies)
  if (!token) return Response.json({ message: 'Belum masuk.' }, { status: 401 })
  try {
    const user = await fetchVerifiedUser(cookies, token)
    return Response.json({ message: 'OK', data: user })
  } catch (error) {
    const status = isApiError(error) ? error.status : 500
    if (status === 401) clearSession(cookies)
    return Response.json({ message: error instanceof Error ? error.message : 'Gagal memuat sesi.' }, { status })
  }
}
