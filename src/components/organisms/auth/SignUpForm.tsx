import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheck } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { FormField } from '@/components/molecules/FormField'
import { PasswordInput } from '@/components/molecules/PasswordInput'
import { withQuery } from '@/lib/queries/client'
import { useSignUp } from '@/lib/queries/auth'
import { getErrorMessage } from '@/lib/api/errors'
import { redirectTo } from '@/lib/utils'
import { signUpSchema, type SignUpValues } from '@/lib/validation'

function SignUpFormBase() {
  const signUp = useSignUp()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', password_confirmation: '' },
  })

  useEffect(() => {
    if (!signUp.isSuccess) return
    const timer = window.setTimeout(() => redirectTo('/auth/signin'), 2500)
    return () => window.clearTimeout(timer)
  }, [signUp.isSuccess])

  const onSubmit = handleSubmit(async (values) => {
    const ok = await signUp.mutateAsync(values).then(
      () => true,
      () => false,
    )
    if (ok) reset()
  })

  if (signUp.isSuccess) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-2xl bg-leaf-50 p-6 text-center">
        <CircleCheck className="h-10 w-10 text-leaf-600" />
        <h2 className="text-lg font-bold">Pendaftaran berhasil!</h2>
        <p className="text-sm text-ink-700">
          Cek email kamu untuk verifikasi akun. Kamu akan diarahkan ke halaman masuk…
        </p>
        <Button href="/auth/signin" variant="soft">
          Masuk sekarang
        </Button>
      </div>
    )
  }

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {signUp.isError ? (
        <div role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-600">
          {getErrorMessage(signUp.error)}
        </div>
      ) : null}
      <FormField label="Nama lengkap" htmlFor="signup-name" error={errors.name?.message} required>
        <Input id="signup-name" autoComplete="name" invalid={Boolean(errors.name)} {...register('name')} />
      </FormField>
      <FormField label="Email" htmlFor="signup-email" error={errors.email?.message} required>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          invalid={Boolean(errors.email)}
          {...register('email')}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Password" htmlFor="signup-password" error={errors.password?.message} required>
          <PasswordInput
            id="signup-password"
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>
        <FormField
          label="Ulangi password"
          htmlFor="signup-password-confirm"
          error={errors.password_confirmation?.message}
          required
        >
          <PasswordInput
            id="signup-password-confirm"
            autoComplete="new-password"
            invalid={Boolean(errors.password_confirmation)}
            {...register('password_confirmation')}
          />
        </FormField>
      </div>
      <Button type="submit" size="lg" block loading={signUp.isPending}>
        Daftar
      </Button>
      <p className="text-center text-xs text-ink-500">
        Dengan mendaftar, kamu menyetujui Syarat Layanan dan Kebijakan Privasi Fresh Market.
      </p>
    </form>
  )
}

export const SignUpForm = withQuery(SignUpFormBase)
