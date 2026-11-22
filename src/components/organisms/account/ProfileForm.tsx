import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Input } from '@/components/atoms/Input'
import { Skeleton } from '@/components/atoms/Skeleton'
import { Textarea } from '@/components/atoms/Textarea'
import { FormField } from '@/components/molecules/FormField'
import { ImageUploader } from '@/components/molecules/ImageUploader'
import { LocationFields } from '@/components/molecules/LocationFields'
import { withQuery } from '@/lib/queries/client'
import { useProfile, useUpdateProfile, useUploadProfilePhoto } from '@/lib/queries/auth'
import { getErrorMessage } from '@/lib/api/errors'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { IMAGE_TYPES, MAX_AVATAR_SIZE } from '@/lib/constants'
import { redirectTo, safeRedirectPath } from '@/lib/utils'
import { profileSchema, type ProfileValues } from '@/lib/validation'
import { toast } from '@/stores/feedback'

function asCoordinate(value: unknown) {
  if (value === null || value === undefined || String(value) === 'null' || String(value) === 'undefined') return ''
  return String(value)
}

function ProfileFormBase({ redirect }: { redirect?: string | null }) {
  const profile = useProfile()
  const update = useUpdateProfile()
  const upload = useUploadProfilePhoto()
  const { locate } = useGeolocation()
  const [photo, setPhoto] = useState('')
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '', phone: '', address: '', lat: '', lng: '' },
  })
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = form

  useEffect(() => {
    const user = profile.data
    if (!user) return
    reset({
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
      lat: asCoordinate(user.lat),
      lng: asCoordinate(user.lng),
    })
    setPhoto(user.photo ?? '')
    if (!asCoordinate(user.lat) || !asCoordinate(user.lng)) {
      locate().then((position) => {
        if (!position) return
        setValue('lat', String(position.lat), { shouldDirty: true })
        setValue('lng', String(position.lng), { shouldDirty: true })
      })
    }
  }, [profile.data])

  async function handlePhoto(file: File) {
    try {
      const url = await upload.mutateAsync(file)
      if (!url) throw new Error('URL foto tidak diterima dari server.')
      setPhoto(url)
      toast.success('Foto berhasil diunggah', 'Klik "Simpan perubahan" untuk menyimpan.')
    } catch (error) {
      toast.error('Gagal mengunggah foto', getErrorMessage(error))
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync({ ...values, photo })
      toast.success('Profil berhasil diperbarui')
      if (redirect) redirectTo(safeRedirectPath(redirect, '/account/setting'))
    } catch (error) {
      toast.error('Gagal memperbarui profil', getErrorMessage(error))
    }
  })

  if (profile.isPending) {
    return (
      <Card className="flex flex-col gap-4 p-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-24 w-full" />
      </Card>
    )
  }

  if (profile.isError) {
    return (
      <Card className="p-6 text-sm text-danger-600" role="alert">
        {getErrorMessage(profile.error)}
      </Card>
    )
  }

  const photoChanged = photo !== (profile.data?.photo ?? '')

  return (
    <Card className="p-6">
      <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold">Foto profil</h2>
          <ImageUploader
            value={photo}
            onSelect={handlePhoto}
            onError={(message) => toast.error('File tidak valid', message)}
            uploading={upload.isPending}
            maxSize={MAX_AVATAR_SIZE}
            accept={[...IMAGE_TYPES, 'image/webp']}
            shape="circle"
            label="Unggah foto"
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <h2 className="text-base font-bold sm:col-span-2">Data diri</h2>
          <FormField label="Nama lengkap" htmlFor="profile-name" error={errors.name?.message} required>
            <Input id="profile-name" autoComplete="name" invalid={Boolean(errors.name)} {...register('name')} />
          </FormField>
          <FormField label="Email" htmlFor="profile-email" error={errors.email?.message} required>
            <Input
              id="profile-email"
              type="email"
              autoComplete="email"
              invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </FormField>
          <FormField label="Nomor telepon" htmlFor="profile-phone" error={errors.phone?.message} required>
            <Input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              placeholder="08xxxxxxxxxx"
              invalid={Boolean(errors.phone)}
              {...register('phone')}
            />
          </FormField>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-base font-bold">Alamat pengiriman</h2>
          <FormField label="Alamat lengkap" htmlFor="profile-address" error={errors.address?.message} required>
            <Textarea
              id="profile-address"
              rows={3}
              autoComplete="street-address"
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota"
              invalid={Boolean(errors.address)}
              {...register('address')}
            />
          </FormField>
          <LocationFields register={register} setValue={setValue} watch={watch} errors={errors} />
        </section>

        <div className="flex justify-end gap-2 border-t border-cream-200 pt-5">
          <Button type="button" variant="ghost" onClick={() => profile.data && reset()} disabled={!isDirty}>
            Batalkan
          </Button>
          <Button type="submit" loading={update.isPending} disabled={!isDirty && !photoChanged}>
            Simpan perubahan
          </Button>
        </div>
      </form>
    </Card>
  )
}

export const ProfileForm = withQuery(ProfileFormBase)
