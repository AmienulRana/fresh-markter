import { createApi } from '@/lib/services'
import { createServerRequester } from './server'

export function serverApi(locals: App.Locals) {
  return createApi(createServerRequester(locals.token))
}

export async function safeLoad<T>(loader: () => Promise<T>): Promise<T | null> {
  try {
    return await loader()
  } catch {
    return null
  }
}
