import { CircleCheck, CircleX } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { withQuery } from '@/lib/queries/client'
import { useVerifyAccount } from '@/lib/queries/auth'
import { getErrorMessage } from '@/lib/api/errors'
import { redirectTo } from '@/lib/utils'

function VerifyAccountBase({ token }: { token: string }) {
  const verify = useVerifyAccount(token)

  useEffect(() => {
    if (!verify.isSuccess) return
    const timer = window.setTimeout(() => redirectTo('/auth/signin'), 3000)
    return () => window.clearTimeout(timer)
  }, [verify.isSuccess])

  if (verify.isPending) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Spinner className="h-8 w-8 text-leaf-600" />
        <p className="text-sm text-ink-700">Memverifikasi akun kamu…</p>
      </div>
    )
  }

  if (verify.isError) {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl bg-danger-50 p-6 text-center">
        <CircleX className="h-10 w-10 text-danger-500" />
        <h2 className="text-lg font-bold">Verifikasi gagal</h2>
        <p className="text-sm text-ink-700">{getErrorMessage(verify.error)}</p>
        <Button href="/auth/signin" variant="outline">
          Ke halaman masuk
        </Button>
      </div>
    )
  }

  return (
    <div role="status" className="flex flex-col items-center gap-3 rounded-2xl bg-leaf-50 p-6 text-center">
      <CircleCheck className="h-10 w-10 text-leaf-600" />
      <h2 className="text-lg font-bold">Akun terverifikasi!</h2>
      <p className="text-sm text-ink-700">Akun kamu sudah aktif. Mengarahkan ke halaman masuk…</p>
      <Button href="/auth/signin">Masuk sekarang</Button>
    </div>
  )
}

export const VerifyAccount = withQuery(VerifyAccountBase)
