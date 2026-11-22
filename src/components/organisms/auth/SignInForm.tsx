import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { SessionUser } from '@/types/user'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { FormField } from '@/components/molecules/FormField'
import { PasswordInput } from '@/components/molecules/PasswordInput'
import { useSignIn } from '@/lib/queries/auth'
import { getErrorMessage } from '@/lib/api/errors'
import { signInSchema, type SignInValues } from '@/lib/validation'

export function SignInForm({ onSuccess }: { onSuccess: (user: SessionUser) => void | Promise<void> }) {
  const signIn = useSignIn()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: '', password: '' } })

  const onSubmit = handleSubmit(async (values) => {
    const res = await signIn.mutateAsync(values).catch(() => null)
    if (res) await onSuccess(res.data)
  })

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {signIn.isError ? (
        <div role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-600">
          {getErrorMessage(signIn.error)}
        </div>
      ) : null}
      <FormField label="Email" htmlFor="signin-email" error={errors.email?.message}>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          leading={<Mail className="h-4 w-4" />}
          invalid={Boolean(errors.email)}
          {...register('email')}
        />
      </FormField>
      <FormField label="Password" htmlFor="signin-password" error={errors.password?.message}>
        <PasswordInput
          id="signin-password"
          autoComplete="current-password"
          placeholder="Masukkan password"
          leading={<Lock className="h-4 w-4" />}
          invalid={Boolean(errors.password)}
          {...register('password')}
        />
      </FormField>
      <div className="flex justify-end">
        <a href="/auth/forgot-password" className="text-sm font-semibold text-leaf-700 hover:underline">
          Lupa password?
        </a>
      </div>
      <Button type="submit" size="lg" block loading={signIn.isPending}>
        Masuk
      </Button>
    </form>
  )
}
