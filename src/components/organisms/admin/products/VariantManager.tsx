import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { VariantInput } from '@/types/catalog'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { ProductImage } from '@/components/atoms/ProductImage'
import { FormField } from '@/components/molecules/FormField'
import { ImageUploader } from '@/components/molecules/ImageUploader'
import { Modal } from '@/components/molecules/Modal'
import { RowActions } from '@/components/molecules/RowActions'
import { useUploadProductImage } from '@/lib/queries/auth'
import { getErrorMessage } from '@/lib/api/errors'
import { formatRupiah, formatWeight } from '@/lib/utils'
import { variantSchema, type VariantValues } from '@/lib/validation'
import { confirmAction, toast } from '@/stores/feedback'

export interface VariantDraft extends VariantInput {
  key: string
}

const EMPTY: VariantValues = { stock: 0, weight: 0, reguler_price: 0, sale_price: 0 }

export function newVariantKey() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function VariantManager({
  variants,
  onChange,
  unit,
  error,
}: {
  variants: VariantDraft[]
  onChange: (variants: VariantDraft[]) => void
  unit: string
  error?: string
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [image, setImage] = useState('')
  const upload = useUploadProductImage()
  const form = useForm<VariantValues>({ resolver: zodResolver(variantSchema), defaultValues: EMPTY })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  function openEditor(variant?: VariantDraft) {
    setEditingKey(variant?.key ?? null)
    reset(
      variant
        ? {
            stock: Number(variant.stock),
            weight: Number(variant.weight),
            reguler_price: Number(variant.reguler_price),
            sale_price: Number(variant.sale_price),
          }
        : EMPTY,
    )
    setImage(variant?.product_image ?? '')
    setOpen(true)
  }

  async function handleImage(file: File) {
    try {
      const url = await upload.mutateAsync(file)
      if (!url) throw new Error('URL gambar tidak diterima dari server.')
      setImage(url)
    } catch (uploadError) {
      toast.error('Gagal mengunggah gambar', getErrorMessage(uploadError))
    }
  }

  const onSubmit = handleSubmit((values) => {
    if (!image) {
      toast.error('Gambar varian wajib diunggah')
      return
    }
    const next: VariantDraft = { ...values, product_image: image, key: editingKey ?? newVariantKey() }
    onChange(editingKey ? variants.map((item) => (item.key === editingKey ? next : item)) : [...variants, next])
    setOpen(false)
  })

  async function handleDelete(variant: VariantDraft) {
    const ok = await confirmAction({
      title: 'Hapus varian?',
      description: `Varian ${formatWeight(variant.weight, unit)} akan dihapus dari produk ini.`,
      confirmLabel: 'Hapus',
      tone: 'danger',
    })
    if (ok) onChange(variants.filter((item) => item.key !== variant.key))
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold">Varian produk</h2>
          <p className="text-sm text-ink-500">Varian pertama dipakai sebagai harga dan gambar utama.</p>
        </div>
        <Button type="button" variant="soft" size="sm" onClick={() => openEditor()}>
          <Plus className="h-4 w-4" /> Tambah varian
        </Button>
      </div>
      {variants.length ? (
        <div className="overflow-x-auto rounded-2xl border border-cream-200">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-cream-50 text-xs tracking-wide text-ink-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Gambar</th>
                <th className="px-4 py-3 text-left font-semibold">Berat</th>
                <th className="px-4 py-3 text-left font-semibold">Stok</th>
                <th className="px-4 py-3 text-left font-semibold">Harga reguler</th>
                <th className="px-4 py-3 text-left font-semibold">Harga jual</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {variants.map((variant, index) => (
                <tr key={variant.key}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ProductImage src={variant.product_image} alt="" className="h-11 w-11 rounded-lg" />
                      {index === 0 ? <span className="text-xs font-semibold text-leaf-700">Utama</span> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatWeight(variant.weight, unit)}</td>
                  <td className="px-4 py-3">{variant.stock}</td>
                  <td className="px-4 py-3 tabular-nums">{formatRupiah(variant.reguler_price)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatRupiah(variant.sale_price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEditor(variant)}
                        className="rounded-full px-3 py-1 text-xs font-semibold text-leaf-700 hover:bg-leaf-50"
                      >
                        Ubah
                      </button>
                      <RowActions label={`varian ${formatWeight(variant.weight, unit)}`} onDelete={() => handleDelete(variant)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-cream-200 bg-cream-50 px-4 py-8 text-center text-sm text-ink-500">
          Belum ada varian. Tambahkan minimal satu varian.
        </div>
      )}
      {error ? <p className="text-xs font-medium text-danger-600">{error}</p> : null}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingKey ? 'Ubah varian' : 'Tambah varian'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={onSubmit} disabled={upload.isPending}>
              Simpan varian
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={`Berat (${unit === 'kilo' ? 'kg' : 'gr'})`} htmlFor="variant-weight" error={errors.weight?.message} required>
            <Input
              id="variant-weight"
              type="number"
              step="any"
              min={0}
              invalid={Boolean(errors.weight)}
              {...register('weight', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Stok" htmlFor="variant-stock" error={errors.stock?.message} required>
            <Input
              id="variant-stock"
              type="number"
              min={0}
              invalid={Boolean(errors.stock)}
              {...register('stock', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Harga reguler (Rp)" htmlFor="variant-regular" error={errors.reguler_price?.message} required>
            <Input
              id="variant-regular"
              type="number"
              min={0}
              invalid={Boolean(errors.reguler_price)}
              {...register('reguler_price', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Harga jual (Rp)" htmlFor="variant-sale" error={errors.sale_price?.message} required>
            <Input
              id="variant-sale"
              type="number"
              min={0}
              invalid={Boolean(errors.sale_price)}
              {...register('sale_price', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Gambar varian" className="sm:col-span-2" required>
            <ImageUploader
              value={image}
              onSelect={handleImage}
              onError={(message) => toast.error('File tidak valid', message)}
              uploading={upload.isPending}
            />
          </FormField>
        </div>
      </Modal>
    </section>
  )
}
