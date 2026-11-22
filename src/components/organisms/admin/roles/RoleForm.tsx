import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Input } from '@/components/atoms/Input'
import { Skeleton } from '@/components/atoms/Skeleton'
import { FormField } from '@/components/molecules/FormField'
import { withQuery } from '@/lib/queries/client'
import { useRole, useSaveRole } from '@/lib/queries/commerce'
import { getErrorMessage } from '@/lib/api/errors'
import { redirectTo } from '@/lib/utils'
import { roleSchema, type RoleValues } from '@/lib/validation'
import { toast } from '@/stores/feedback'

function RoleFormBase({ roleId }: { roleId?: string }) {
  const isEdit = Boolean(roleId)
  const detail = useRole(roleId ?? '')
  const save = useSaveRole(roleId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleValues>({ resolver: zodResolver(roleSchema), defaultValues: { name: '' } })

  useEffect(() => {
    if (isEdit && detail.data) reset({ name: detail.data.name ?? '' })
  }, [detail.data, isEdit])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(values.name)
      toast.success(isEdit ? 'Role berhasil diperbarui' : 'Role berhasil dibuat')
      redirectTo('/dashboard/role')
    } catch (error) {
      toast.error(isEdit ? 'Gagal memperbarui role' : 'Gagal membuat role', getErrorMessage(error))
    }
  })

  if (isEdit && detail.isPending) {
    return (
      <Card className="flex max-w-xl flex-col gap-4 p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-11 w-full" />
      </Card>
    )
  }

  if (isEdit && detail.isError) {
    return (
      <Card className="max-w-xl p-6 text-sm text-danger-600" role="alert">
        {getErrorMessage(detail.error, 'Gagal memuat role.')}
      </Card>
    )
  }

  return (
    <Card className="max-w-xl p-6">
      <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField label="Nama role" htmlFor="role-name" error={errors.name?.message} required>
          <Input id="role-name" placeholder="Contoh: Staff Gudang" invalid={Boolean(errors.name)} {...register('name')} />
        </FormField>
        <div className="flex justify-end gap-2 border-t border-cream-200 pt-5">
          <Button href="/dashboard/role" variant="ghost">
            Batal
          </Button>
          <Button type="submit" loading={save.isPending}>
            {isEdit ? 'Simpan perubahan' : 'Buat role'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export const RoleForm = withQuery(RoleFormBase)
