import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { FormField } from '@/components/molecules/FormField'
import { withQuery } from '@/lib/queries/client'
import { useForgotPassword } from '@/lib/queries/auth'
import { getErrorMessage } from '@/lib/api/errors'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/validation'

function ForgotPasswordFormBase() {
  const forgot = useForgotPassword()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } })

  const onSubmit = handleSubmit(async (values) => {
    await forgot.mutateAsync(values.email).catch(() => null)
  })

  if (forgot.isSuccess) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-2xl bg-leaf-50 p-6 text-center">
        <MailCheck className="h-10 w-10 text-leaf-600" />
        <h2 className="text-lg font-bold">Cek email kamu</h2>
        <p className="text-sm text-ink-700">
          Tautan untuk mengatur ulang password sudah dikirim ke <strong>{getValues('email')}</strong>.
        </p>
        <Button href="/auth/signin" variant="soft">
          Kembali ke halaman masuk
        </Button>
      </div>
    )
  }

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {forgot.isError ? (
        <div role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-600">
          {getErrorMessage(forgot.error)}
        </div>
      ) : null}
      <FormField label="Email" htmlFor="forgot-email" error={errors.email?.message}>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          invalid={Boolean(errors.email)}
          {...register('email')}
        />
      </FormField>
      <Button type="submit" size="lg" block loading={forgot.isPending}>
        Kirim tautan reset
      </Button>
      <a href="/auth/signin" className="text-center text-sm font-semibold text-leaf-700 hover:underline">
        Kembali ke halaman masuk
      </a>
    </form>
  )
}

export const ForgotPasswordForm = withQuery(ForgotPasswordFormBase)
