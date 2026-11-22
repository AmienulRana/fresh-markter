import { PUBLIC_MIDTRANS_CLIENT_KEY, PUBLIC_MIDTRANS_SNAP_URL } from 'astro:env/client'

let loader: Promise<NonNullable<Window['snap']>> | null = null

export function loadSnap() {
  if (window.snap) return Promise.resolve(window.snap)
  if (loader) return loader
  loader = new Promise((resolve, reject) => {
    if (!PUBLIC_MIDTRANS_CLIENT_KEY) {
      reject(new Error('Kunci klien Midtrans belum dikonfigurasi.'))
      return
    }
    const script = document.createElement('script')
    script.src = PUBLIC_MIDTRANS_SNAP_URL
    script.async = true
    script.dataset.clientKey = PUBLIC_MIDTRANS_CLIENT_KEY
    script.onload = () => (window.snap ? resolve(window.snap) : reject(new Error('Midtrans Snap tidak tersedia.')))
    script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap.'))
    document.head.appendChild(script)
  }).catch((error) => {
    loader = null
    throw error
  }) as Promise<NonNullable<Window['snap']>>
  return loader
}

export type SnapOutcome = 'success' | 'pending' | 'error' | 'closed'

export async function paySnap(token: string) {
  const snap = await loadSnap()
  return new Promise<SnapOutcome>((resolve) => {
    snap.pay(token, {
      onSuccess: () => resolve('success'),
      onPending: () => resolve('pending'),
      onError: () => resolve('error'),
      onClose: () => resolve('closed'),
    })
  })
}
