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
import { OptionCard } from '@/components/molecules/OptionCard'
import { withQuery } from '@/lib/queries/client'
import { useUploadProductImage } from '@/lib/queries/auth'
import { useAdminCategory, useSaveCategory } from '@/lib/queries/catalog'
import { getErrorMessage } from '@/lib/api/errors'
import { CATEGORY_STATUS_OPTIONS } from '@/lib/constants'
import { redirectTo } from '@/lib/utils'
import { categorySchema, type CategoryValues } from '@/lib/validation'
import { toast } from '@/stores/feedback'

function CategoryFormBase({ categoryId }: { categoryId?: string }) {
  const isEdit = Boolean(categoryId)
  const detail = useAdminCategory(categoryId ?? '')
  const save = useSaveCategory(categoryId)
  const upload = useUploadProductImage()
  const [icon, setIcon] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', status: 'Published' },
  })

  useEffect(() => {
    const category = detail.data
    if (!isEdit || !category) return
    reset({
      name: category.name ?? '',
      description: category.description ?? '',
      status: category.status === 'Unpublished' ? 'Unpublished' : 'Published',
    })
    setIcon(category.icon ?? '')
  }, [detail.data, isEdit])

  async function handleIcon(file: File) {
    try {
      const url = await upload.mutateAsync(file)
      if (!url) throw new Error('URL gambar tidak diterima dari server.')
      setIcon(url)
    } catch (error) {
      toast.error('Gagal mengunggah ikon', getErrorMessage(error))
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync({
        name: values.name,
        description: values.description,
        status: values.status,
        icon,
        parent_id: null,
      })
      toast.success(isEdit ? 'Kategori berhasil diperbarui' : 'Kategori berhasil dibuat')
      redirectTo('/dashboard/categories')
    } catch (error) {
      toast.error(isEdit ? 'Gagal memperbarui kategori' : 'Gagal membuat kategori', getErrorMessage(error))
    }
  })

  if (isEdit && detail.isPending) {
    return (
      <Card className="flex max-w-3xl flex-col gap-4 p-6">
        <Skeleton className="h-20 w-20" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-24 w-full" />
      </Card>
    )
  }

  if (isEdit && detail.isError) {
    return (
      <Card className="p-6 text-sm text-danger-600" role="alert">
        {getErrorMessage(detail.error, 'Gagal memuat kategori.')}
      </Card>
    )
  }

  const status = watch('status')

  return (
    <Card className="max-w-3xl p-6">
      <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <FormField label="Ikon kategori">
          <ImageUploader
            value={icon}
            onSelect={handleIcon}
            onError={(message) => toast.error('File tidak valid', message)}
            uploading={upload.isPending}
          />
        </FormField>
        <FormField label="Nama kategori" htmlFor="category-name" error={errors.name?.message} required>
          <Input id="category-name" invalid={Boolean(errors.name)} {...register('name')} />
        </FormField>
        <FormField label="Deskripsi" htmlFor="category-description" error={errors.description?.message}>
          <Textarea id="category-description" rows={4} {...register('description')} />
        </FormField>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold text-ink-700">Status</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORY_STATUS_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                name="category-status"
                value={option.value}
                checked={status === option.value}
                onChange={(value) => setValue('status', value as CategoryValues['status'], { shouldDirty: true })}
                title={option.label}
                description={option.value === 'Published' ? 'Tampil di toko.' : 'Disembunyikan dari toko.'}
              />
            ))}
          </div>
        </fieldset>
        <div className="flex justify-end gap-2 border-t border-cream-200 pt-5">
          <Button href="/dashboard/categories" variant="ghost">
            Batal
          </Button>
          <Button type="submit" loading={save.isPending} disabled={upload.isPending}>
            {isEdit ? 'Simpan perubahan' : 'Buat kategori'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export const CategoryForm = withQuery(CategoryFormBase)
