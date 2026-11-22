import type { APIRoute } from 'astro'
import { createApi } from '@/lib/services'
import { createServerRequester } from '@/lib/api/server'
import { getErrorMessage } from '@/lib/api/errors'

async function probe(check: () => Promise<unknown>) {
  try {
    await check()
    return { ok: true }
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) }
  }
}

export const GET: APIRoute = async () => {
  const api = createApi(createServerRequester())
  const [gateway, userService] = await Promise.all([probe(api.system.health), probe(api.system.userServiceCheck)])
  const healthy = gateway.ok && userService.ok
  return Response.json(
    { status: healthy ? 'ok' : 'degraded', checks: { gateway, userService } },
    { status: healthy ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
