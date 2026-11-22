/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: import('@/types/user').SessionUser | null
    token: string | null
  }
}

interface Window {
  snap?: {
    pay: (
      token: string,
      callbacks: {
        onSuccess?: (result: unknown) => void
        onPending?: (result: unknown) => void
        onError?: (result: unknown) => void
        onClose?: () => void
      },
    ) => void
  }
}
