import { zodResolver } from '@hookform/resolvers/zod'
import { PackageSearch } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { SessionUser } from '@/types/user'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Input } from '@/components/atoms/Input'
import { FormField } from '@/components/molecules/FormField'
import { withQuery } from '@/lib/queries/client'
import { usePublicOrderLookup } from '@/lib/queries/commerce'
import { useSessionUser } from '@/lib/hooks/useSessionUser'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import { redirectTo } from '@/lib/utils'
import { trackOrderSchema, type TrackOrderValues } from '@/lib/validation'

function TrackOrderFormBase({ user: serverUser, initialCode = '' }: { user: SessionUser | null; initialCode?: string }) {
  const user = useSessionUser(serverUser)
  const lookup = usePublicOrderLookup()
  const [found, setFound] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TrackOrderValues>({ resolver: zodResolver(trackOrderSchema), defaultValues: { code: initialCode } })

  const onSubmit = handleSubmit(async ({ code }) => {
    setFound(null)
    const normalized = code.trim().toUpperCase()
    try {
      await lookup.mutateAsync(normalized)
      const detailPath = `/account/orders/${encodeURIComponent(normalized)}`
      if (user) {
        redirectTo(detailPath)
        return
      }
      setFound(detailPath)
    } catch (error) {
      const message =
        isApiError(error) && error.status === 404
          ? 'Kode pesanan tidak ditemukan. Periksa kembali kode di email konfirmasimu.'
          : getErrorMessage(error)
      setError('code', { message })
    }
  })

  return (
    <Card className="mx-auto flex max-w-lg flex-col gap-6 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf-50 text-leaf-700">
          <PackageSearch className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold">Lacak pesanan</h1>
          <p className="text-sm text-ink-500">Masukkan kode pesanan untuk melihat statusnya.</p>
        </div>
      </div>
      <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Kode pesanan" htmlFor="track-code" error={errors.code?.message} required>
          <Input
            id="track-code"
            placeholder="Contoh: ORD-20261120093000-123456"
            autoComplete="off"
            invalid={Boolean(errors.code)}
            {...register('code')}
          />
        </FormField>
        <Button type="submit" loading={lookup.isPending}>
          Cari pesanan
        </Button>
      </form>
      {found ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-leaf-50 p-4 text-sm text-ink-700" role="status">
          <p>
            <span className="font-semibold">Pesanan ditemukan.</span> Masuk dengan akun yang membuat pesanan ini untuk
            melihat detail dan statusnya.
          </p>
          <Button href={`/auth/signin?redirect=${encodeURIComponent(found)}`} size="sm" className="self-start">
            Masuk untuk melihat detail
          </Button>
        </div>
      ) : null}
    </Card>
  )
}

export const TrackOrderForm = withQuery(TrackOrderFormBase)
