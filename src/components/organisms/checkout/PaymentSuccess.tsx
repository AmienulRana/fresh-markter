import { CircleCheck, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { redirectTo } from '@/lib/utils'

const REDIRECT_SECONDS = 5

export function PaymentSuccess({ pending, orderRef }: { pending?: boolean; orderRef?: string }) {
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    const interval = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000)
    const timeout = window.setTimeout(() => redirectTo('/'), REDIRECT_SECONDS * 1000)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [])

  return (
    <Card className="mx-auto flex max-w-lg flex-col items-center gap-4 p-8 text-center sm:p-12">
      <span
        className={
          pending
            ? 'flex h-20 w-20 items-center justify-center rounded-full bg-sun-100 text-sun-600'
            : 'flex h-20 w-20 items-center justify-center rounded-full bg-leaf-50 text-leaf-600'
        }
      >
        {pending ? <Clock className="h-10 w-10" /> : <CircleCheck className="h-10 w-10" />}
      </span>
      <h1 className="font-display text-3xl font-semibold">
        {pending ? 'Pesanan dibuat, menunggu pembayaran' : 'Terima kasih, pesananmu diterima!'}
      </h1>
      <p className="text-ink-700">
        {pending
          ? 'Selesaikan pembayaran sesuai instruksi Midtrans. Status pesanan akan diperbarui otomatis.'
          : 'Tim kami sedang menyiapkan pesananmu. Kamu bisa memantau statusnya di halaman Pesanan saya.'}
      </p>
      <p className="text-sm text-ink-500" aria-live="polite">
        Kembali ke beranda dalam {seconds} detik…
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button href={orderRef ? `/account/orders/${encodeURIComponent(orderRef)}` : '/account'} variant="outline">
          Lihat pesanan
        </Button>
        <Button href="/shop">Belanja lagi</Button>
      </div>
    </Card>
  )
}
