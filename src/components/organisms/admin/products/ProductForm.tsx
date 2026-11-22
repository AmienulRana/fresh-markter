import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { Skeleton } from '@/components/atoms/Skeleton'
import { Textarea } from '@/components/atoms/Textarea'
import { FormField } from '@/components/molecules/FormField'
import { withQuery } from '@/lib/queries/client'
import { useAdminCategories, useAdminProduct, useSaveProduct } from '@/lib/queries/catalog'
import { getErrorMessage } from '@/lib/api/errors'
import { PRODUCT_STATUS_OPTIONS, PRODUCT_UNITS } from '@/lib/constants'
import { redirectTo } from '@/lib/utils'
import { productSchema, type ProductValues } from '@/lib/validation'
import { toast } from '@/stores/feedback'
import { newVariantKey, VariantManager, type VariantDraft } from './VariantManager'

const DEFAULTS: ProductValues = { name: '', category_slug: '', unit: 'gram', description: '', status: 'ACTIVE' }

function normalizeStatus(value?: string): ProductValues['status'] {
  const upper = (value ?? '').toUpperCase()
  if (upper === 'DEACTIVE' || upper === 'INACTIVE') return 'INACTIVE'
  if (upper === 'DRAFT') return 'DRAFT'
  return 'ACTIVE'
}

function ProductFormBase({ productId }: { productId?: string }) {
  const isEdit = Boolean(productId)
  const detail = useAdminProduct(productId ?? '')
  const { data: categories } = useAdminCategories({ page: 1, limit: 100 })
  const save = useSaveProduct(productId)
  const [variants, setVariants] = useState<VariantDraft[]>([])
  const [variantError, setVariantError] = useState<string>()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductValues>({ resolver: zodResolver(productSchema), defaultValues: DEFAULTS })

  useEffect(() => {
    const product = detail.data
    if (!isEdit || !product) return
    reset({
      name: product.product_name ?? '',
      category_slug: product.category_slug ?? '',
      unit: product.unit === 'kilo' ? 'kilo' : 'gram',
      description: product.product_description ?? product.description ?? '',
      status: normalizeStatus(product.product_status),
    })
    const rows = [product, ...(product.child ?? [])].map((item) => ({
      key: newVariantKey(),
      stock: Number(item.stock ?? 0),
      weight: Number(item.weight ?? 0),
      reguler_price: Number(item.reguler_price ?? 0),
      sale_price: Number(item.sale_price ?? 0),
      product_image: item.product_image ?? '',
    }))
    setVariants(rows)
  }, [detail.data, isEdit])

  const onSubmit = handleSubmit(async (values) => {
    if (!variants.length) {
      setVariantError('Tambahkan minimal satu varian.')
      return
    }
    setVariantError(undefined)
    try {
      await save.mutateAsync({
        product_name: values.name,
        category_slug: values.category_slug,
        unit: values.unit,
        product_description: values.description,
        status: values.status,
        variant_detail: variants.map(({ key: _key, ...variant }) => variant),
        variant: variants.length,
      })
      toast.success(isEdit ? 'Produk berhasil diperbarui' : 'Produk berhasil dibuat')
      redirectTo('/dashboard/products')
    } catch (error) {
      toast.error(isEdit ? 'Gagal memperbarui produk' : 'Gagal membuat produk', getErrorMessage(error))
    }
  })

  if (isEdit && detail.isPending) {
    return (
      <Card className="flex flex-col gap-4 p-6">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-32 w-full" />
      </Card>
    )
  }

  if (isEdit && detail.isError) {
    return (
      <Card className="p-6 text-sm text-danger-600" role="alert">
        {getErrorMessage(detail.error, 'Gagal memuat data produk.')}
      </Card>
    )
  }

  const categoryOptions = (categories?.items ?? []).map((category) => ({ value: category.slug, label: category.name }))
  const currentSlug = watch('category_slug')
  if (currentSlug && !categoryOptions.some((option) => option.value === currentSlug)) {
    categoryOptions.push({ value: currentSlug, label: detail.data?.category_name ?? currentSlug })
  }

  return (
    <form method="post" onSubmit={onSubmit} noValidate className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <Card className="grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-base font-bold sm:col-span-2">Informasi produk</h2>
          <FormField label="Nama produk" htmlFor="product-name" error={errors.name?.message} required className="sm:col-span-2">
            <Input id="product-name" invalid={Boolean(errors.name)} {...register('name')} />
          </FormField>
          <FormField label="Kategori" htmlFor="product-category" error={errors.category_slug?.message} required>
            <Select
              id="product-category"
              placeholder="Pilih kategori"
              options={categoryOptions}
              invalid={Boolean(errors.category_slug)}
              {...register('category_slug')}
            />
          </FormField>
          <FormField label="Satuan berat" htmlFor="product-unit" error={errors.unit?.message} required>
            <Select id="product-unit" options={PRODUCT_UNITS} {...register('unit')} />
          </FormField>
          <FormField
            label="Deskripsi"
            htmlFor="product-description"
            error={errors.description?.message}
            required
            className="sm:col-span-2"
          >
            <Textarea id="product-description" rows={5} invalid={Boolean(errors.description)} {...register('description')} />
          </FormField>
        </Card>
        <Card className="p-6">
          <VariantManager variants={variants} onChange={setVariants} unit={watch('unit')} error={variantError} />
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col gap-4 p-6">
          <h2 className="text-base font-bold">Status</h2>
          <FormField label="Status produk" htmlFor="product-status" error={errors.status?.message}>
            <Select id="product-status" options={PRODUCT_STATUS_OPTIONS} {...register('status')} />
          </FormField>
        </Card>
        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" loading={save.isPending}>
            {isEdit ? 'Simpan perubahan' : 'Buat produk'}
          </Button>
          <Button href="/dashboard/products" variant="ghost">
            Batal
          </Button>
        </div>
      </div>
    </form>
  )
}

export const ProductForm = withQuery(ProductFormBase)
