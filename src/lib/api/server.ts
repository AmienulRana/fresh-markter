import { API_GATEWAY_URL } from 'astro:env/server'
import { ApiError } from './errors'
import { buildInit, parseResponse, toQueryString, type Requester } from './request'

export function getGatewayUrl() {
  if (!API_GATEWAY_URL) throw new ApiError(503, 'API_GATEWAY_URL belum dikonfigurasi.')
  return API_GATEWAY_URL.replace(/\/+$/, '')
}

export function createServerRequester(token?: string | null): Requester {
  return async (path, options = {}) => {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    const url = `${getGatewayUrl()}${path}${toQueryString(options.query)}`
    const response = await fetch(url, buildInit(options, headers))
    return parseResponse(response)
  }
}
