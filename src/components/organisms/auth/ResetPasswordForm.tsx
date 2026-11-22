import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheck } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/atoms/Button'
import { FormField } from '@/components/molecules/FormField'
import { PasswordInput } from '@/components/molecules/PasswordInput'
import { withQuery } from '@/lib/queries/client'
import { useResetPassword } from '@/lib/queries/auth'
import { getErrorMessage } from '@/lib/api/errors'
import { redirectTo } from '@/lib/utils'
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/validation'

function ResetPasswordFormBase({ token }: { token: string }) {
  const reset = useResetPassword()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password_new: '', password_confirmation: '' },
  })

  useEffect(() => {
    if (!reset.isSuccess) return
    const timer = window.setTimeout(() => redirectTo('/auth/signin'), 2500)
    return () => window.clearTimeout(timer)
  }, [reset.isSuccess])

  const onSubmit = handleSubmit(async (values) => {
    await reset.mutateAsync({ ...values, token }).catch(() => null)
  })

  if (reset.isSuccess) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-2xl bg-leaf-50 p-6 text-center">
        <CircleCheck className="h-10 w-10 text-leaf-600" />
        <h2 className="text-lg font-bold">Password berhasil diperbarui</h2>
        <p className="text-sm text-ink-700">Silakan masuk dengan password baru kamu.</p>
        <Button href="/auth/signin" variant="soft">
          Masuk
        </Button>
      </div>
    )
  }

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {reset.isError ? (
        <div role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-600">
          {getErrorMessage(reset.error)}
        </div>
      ) : null}
      <FormField label="Password baru" htmlFor="reset-password" error={errors.password_new?.message}>
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          invalid={Boolean(errors.password_new)}
          {...register('password_new')}
        />
      </FormField>
      <FormField
        label="Ulangi password baru"
        htmlFor="reset-password-confirm"
        error={errors.password_confirmation?.message}
      >
        <PasswordInput
          id="reset-password-confirm"
          autoComplete="new-password"
          invalid={Boolean(errors.password_confirmation)}
          {...register('password_confirmation')}
        />
      </FormField>
      <Button type="submit" size="lg" block loading={reset.isPending}>
        Simpan password
      </Button>
    </form>
  )
}

export const ResetPasswordForm = withQuery(ResetPasswordFormBase)
