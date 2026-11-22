import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { CustomerPayload } from '@/types/user'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Input } from '@/components/atoms/Input'
import { Skeleton } from '@/components/atoms/Skeleton'
import { Textarea } from '@/components/atoms/Textarea'
import { FormField } from '@/components/molecules/FormField'
import { ImageUploader } from '@/components/molecules/ImageUploader'
import { LocationFields } from '@/components/molecules/LocationFields'
import { PasswordInput } from '@/components/molecules/PasswordInput'
import { withQuery } from '@/lib/queries/client'
import { useUploadProfilePhoto } from '@/lib/queries/auth'
import { useCustomer, useSaveCustomer } from '@/lib/queries/commerce'
import { getErrorMessage } from '@/lib/api/errors'
import { CUSTOMER_ROLE_ID } from '@/lib/constants'
import { redirectTo } from '@/lib/utils'
import { customerSchema, type CustomerValues } from '@/lib/validation'
import { toast } from '@/stores/feedback'

function toCoordinate(value: unknown) {
  if (value === null || value === undefined || String(value) === 'null') return ''
  return String(value)
}

function CustomerFormBase({ customerId }: { customerId?: string }) {
  const isEdit = Boolean(customerId)
  const detail = useCustomer(customerId ?? '')
  const save = useSaveCustomer(customerId)
  const upload = useUploadProfilePhoto()
  const [photo, setPhoto] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', email: '', phone: '', address: '', lat: '', lng: '', password: '', password_confirmation: '' },
  })

  useEffect(() => {
    const customer = detail.data
    if (!isEdit || !customer) return
    reset({
      name: customer.name ?? '',
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      lat: toCoordinate(customer.lat),
      lng: toCoordinate(customer.lng),
      password: '',
      password_confirmation: '',
    })
    setPhoto(customer.photo ?? '')
  }, [detail.data, isEdit])

  async function handlePhoto(file: File) {
    try {
      const url = await upload.mutateAsync(file)
      if (!url) throw new Error('URL foto tidak diterima dari server.')
      setPhoto(url)
    } catch (error) {
      toast.error('Gagal mengunggah foto', getErrorMessage(error))
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!isEdit && values.password.length < 8) {
      setError('password', { message: 'Password minimal 8 karakter.' })
      return
    }
    if (isEdit && values.password && values.password.length < 8) {
      setError('password', { message: 'Password minimal 8 karakter.' })
      return
    }
    const payload: CustomerPayload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      photo,
      address: values.address,
      lat: values.lat ? parseFloat(values.lat) : 0,
      lng: values.lng ? parseFloat(values.lng) : 0,
      role_id: CUSTOMER_ROLE_ID,
    }
    if (values.password) {
      payload.password = values.password
      payload.password_confirmation = values.password_confirmation
    }
    try {
      await save.mutateAsync(payload)
      toast.success(isEdit ? 'Data pelanggan diperbarui' : 'Pelanggan berhasil ditambahkan')
      redirectTo('/dashboard/customers')
    } catch (error) {
      toast.error(isEdit ? 'Gagal memperbarui pelanggan' : 'Gagal menambahkan pelanggan', getErrorMessage(error))
    }
  })

  if (isEdit && detail.isPending) {
    return (
      <Card className="flex max-w-4xl flex-col gap-4 p-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </Card>
    )
  }

  if (isEdit && detail.isError) {
    return (
      <Card className="p-6 text-sm text-danger-600" role="alert">
        {getErrorMessage(detail.error, 'Gagal memuat data pelanggan.')}
      </Card>
    )
  }

  return (
    <Card className="max-w-4xl p-6">
      <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <FormField label="Foto">
          <ImageUploader
            value={photo}
            onSelect={handlePhoto}
            onError={(message) => toast.error('File tidak valid', message)}
            uploading={upload.isPending}
            shape="circle"
            label="Unggah foto"
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nama lengkap" htmlFor="customer-name" error={errors.name?.message} required>
            <Input id="customer-name" invalid={Boolean(errors.name)} {...register('name')} />
          </FormField>
          <FormField label="Email" htmlFor="customer-email" error={errors.email?.message} required>
            <Input id="customer-email" type="email" invalid={Boolean(errors.email)} {...register('email')} />
          </FormField>
          <FormField label="Nomor telepon" htmlFor="customer-phone" error={errors.phone?.message} required>
            <Input id="customer-phone" type="tel" invalid={Boolean(errors.phone)} {...register('phone')} />
          </FormField>
        </div>
        <FormField label="Alamat" htmlFor="customer-address" error={errors.address?.message} required>
          <Textarea id="customer-address" rows={3} invalid={Boolean(errors.address)} {...register('address')} />
        </FormField>
        <LocationFields register={register} setValue={setValue} watch={watch} errors={errors} />
        <div className="grid gap-4 sm:grid-cols-2">
          <h2 className="text-base font-bold sm:col-span-2">
            Password {isEdit ? <span className="text-sm font-normal text-ink-500">(kosongkan jika tidak diubah)</span> : null}
          </h2>
          <FormField label="Password" htmlFor="customer-password" error={errors.password?.message} required={!isEdit}>
            <PasswordInput
              id="customer-password"
              autoComplete="new-password"
              invalid={Boolean(errors.password)}
              {...register('password')}
            />
          </FormField>
          <FormField
            label="Ulangi password"
            htmlFor="customer-password-confirm"
            error={errors.password_confirmation?.message}
            required={!isEdit}
          >
            <PasswordInput
              id="customer-password-confirm"
              autoComplete="new-password"
              invalid={Boolean(errors.password_confirmation)}
              {...register('password_confirmation')}
            />
          </FormField>
        </div>
        <div className="flex justify-end gap-2 border-t border-cream-200 pt-5">
          <Button href="/dashboard/customers" variant="ghost">
            Batal
          </Button>
          <Button type="submit" loading={save.isPending} disabled={upload.isPending}>
            {isEdit ? 'Simpan perubahan' : 'Tambah pelanggan'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export const CustomerForm = withQuery(CustomerFormBase)
