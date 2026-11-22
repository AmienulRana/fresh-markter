import type { APIRoute } from 'astro'
import { clearSession } from '@/lib/auth/cookies'

export const POST: APIRoute = async ({ cookies }) => {
  clearSession(cookies)
  return Response.json({ message: 'Berhasil keluar.', data: null })
}
