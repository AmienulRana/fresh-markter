import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ComponentType, type ReactNode } from 'react'
import { isApiError } from '@/lib/api/errors'
import { $session, setSession } from '@/stores/session'
import { refreshSession } from './auth'

const VERIFY_INTERVAL = 60_000
let verifying: Promise<void> | null = null
let lastVerifiedAt = 0

function handleUnauthorized(error: unknown) {
  if (!isApiError(error) || error.status !== 401 || !$session.get()) return
  if (verifying || Date.now() - lastVerifiedAt < VERIFY_INTERVAL) return
  verifying = refreshSession()
    .then(() => {
      lastVerifiedAt = Date.now()
    })
    .catch((refreshError: unknown) => {
      if (isApiError(refreshError) && refreshError.status === 401) setSession(null)
    })
    .finally(() => {
      verifying = null
    })
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleUnauthorized }),
    mutationCache: new MutationCache({ onError: handleUnauthorized }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: (count, error) => !(isApiError(error) && error.status < 500) && count < 1,
      },
    },
  })
}

let browserClient: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  browserClient ??= makeQueryClient()
  return browserClient
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(getQueryClient)
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export function withQuery<P extends object>(Component: ComponentType<P>) {
  function WithQuery(props: P) {
    return (
      <QueryProvider>
        <Component {...props} />
      </QueryProvider>
    )
  }
  WithQuery.displayName = `WithQuery(${Component.displayName ?? Component.name})`
  return WithQuery
}
