import type { APIRoute } from 'astro'
import { getGatewayUrl } from '@/lib/api/server'
import { isApiError } from '@/lib/api/errors'

const FORWARDED_HEADERS = ['content-type', 'accept']

export const ALL: APIRoute = async ({ params, request, url, locals }) => {
  const path = params.path ?? ''

  if (path.split('/').some((segment) => segment === '..' || segment === '.')) {
    return Response.json({ message: 'Path tidak valid.' }, { status: 400 })
  }

  let base: string
  try {
    base = getGatewayUrl()
  } catch (error) {
    const status = isApiError(error) ? error.status : 500
    return Response.json({ message: error instanceof Error ? error.message : 'Gateway tidak tersedia.' }, { status })
  }

  const headers = new Headers()
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  if (locals.token) headers.set('Authorization', `Bearer ${locals.token}`)

  const hasBody = !['GET', 'HEAD'].includes(request.method)

  try {
    const upstream = await fetch(`${base}/${path}${url.search}`, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
    })
    const responseHeaders = new Headers()
    const contentType = upstream.headers.get('content-type')
    if (contentType) responseHeaders.set('content-type', contentType)
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
  } catch {
    return Response.json({ message: 'Tidak dapat terhubung ke server.' }, { status: 502 })
  }
}
