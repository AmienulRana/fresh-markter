import type { ApiEnvelope, Pagination, RawPagination } from '@/types/api'
import { ApiError } from './errors'

export type QueryValue = string | number | boolean | null | undefined

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Record<string, QueryValue>
  body?: unknown
  formData?: FormData
  signal?: AbortSignal
}

export type Requester = <T>(path: string, options?: RequestOptions) => Promise<ApiEnvelope<T>>

export function toQueryString(query?: Record<string, QueryValue>) {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    params.append(key, String(value))
  }
  const result = params.toString()
  return result ? `?${result}` : ''
}

export function buildInit(options: RequestOptions, headers: Record<string, string> = {}): RequestInit {
  const init: RequestInit = { method: options.method ?? 'GET', signal: options.signal, headers: { ...headers } }
  if (options.formData) {
    init.body = options.formData
  } else if (options.body !== undefined) {
    init.body = JSON.stringify(options.body)
    ;(init.headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  return init
}

export async function parseResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { message: text }
    }
  }
  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : '') || defaultMessage(response.status)
    throw new ApiError(response.status, message, payload)
  }
  return (payload ?? { data: null }) as ApiEnvelope<T>
}

function defaultMessage(status: number) {
  if (status === 401) return 'Sesi kamu telah berakhir, silakan masuk kembali.'
  if (status === 403) return 'Kamu tidak memiliki akses untuk aksi ini.'
  if (status === 404) return 'Data tidak ditemukan.'
  if (status >= 500) return 'Server sedang bermasalah, silakan coba lagi nanti.'
  return 'Terjadi kesalahan, silakan coba lagi.'
}

export function normalizePagination(raw: RawPagination | undefined, itemCount: number): Pagination {
  const perPage = raw?.per_page || itemCount || 10
  const totalCount = raw?.total_count ?? itemCount
  const totalPages = raw?.total_page ?? raw?.total_pages ?? Math.max(1, Math.ceil(totalCount / perPage))
  return {
    page: raw?.page ?? raw?.current_page ?? 1,
    perPage,
    totalCount,
    totalPages: Math.max(1, totalPages),
  }
}
