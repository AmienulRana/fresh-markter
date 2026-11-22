import type { APIRoute } from 'astro'
import type { User } from '@/types/user'
import { createServerRequester } from '@/lib/api/server'
import { isApiError } from '@/lib/api/errors'
import { toSessionUser, writeSession } from '@/lib/auth/cookies'

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: 'Format permintaan tidak valid.' }, { status: 400 })
  }

  if (!body.email || !body.password) {
    return Response.json({ message: 'Email dan password wajib diisi.' }, { status: 422 })
  }

  try {
    const res = await createServerRequester()<User & { access_token?: string }>('/signin', {
      method: 'POST',
      body: { email: body.email, password: body.password },
    })
    const token = res.data?.access_token
    if (!token) return Response.json({ message: 'Token tidak diterima dari server.' }, { status: 502 })
    const user = toSessionUser(res.data)
    writeSession(cookies, token, user)
    return Response.json({ message: res.message ?? 'Berhasil masuk.', data: user })
  } catch (error) {
    const status = isApiError(error) ? error.status : 500
    const message = error instanceof Error ? error.message : 'Gagal masuk.'
    return Response.json({ message }, { status })
  }
}
