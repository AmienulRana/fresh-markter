import { atom } from 'nanostores'

export type ToastTone = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  tone: ToastTone
  title: string
  description?: string
}

export interface ConfirmRequest {
  title: string
  description?: string
  confirmLabel?: string
  tone?: 'danger' | 'default'
  resolve: (value: boolean) => void
}

export const $toasts = atom<Toast[]>([])
export const $confirm = atom<ConfirmRequest | null>(null)

let nextId = 1

function push(tone: ToastTone, title: string, description?: string) {
  const id = nextId++
  $toasts.set([...$toasts.get(), { id, tone, title, description }])
  if (typeof window !== 'undefined') window.setTimeout(() => dismissToast(id), 4500)
  return id
}

export function dismissToast(id: number) {
  $toasts.set($toasts.get().filter((toast) => toast.id !== id))
}

export const toast = {
  success: (title: string, description?: string) => push('success', title, description),
  error: (title: string, description?: string) => push('error', title, description),
  info: (title: string, description?: string) => push('info', title, description),
}

export function confirmAction(options: Omit<ConfirmRequest, 'resolve'>) {
  return new Promise<boolean>((resolve) => {
    $confirm.set({ ...options, resolve })
  })
}

export function settleConfirm(value: boolean) {
  const current = $confirm.get()
  if (!current) return
  current.resolve(value)
  $confirm.set(null)
}
