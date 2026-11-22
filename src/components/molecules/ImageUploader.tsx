import { ImagePlus, Upload } from 'lucide-react'
import { useId, useRef, type ChangeEvent } from 'react'
import { Spinner } from '@/components/atoms/Spinner'
import { ProductImage } from '@/components/atoms/ProductImage'
import { cn, validateImageFile } from '@/lib/utils'
import { IMAGE_TYPES, MAX_UPLOAD_SIZE } from '@/lib/constants'

export function ImageUploader({
  value,
  onSelect,
  onError,
  uploading,
  maxSize = MAX_UPLOAD_SIZE,
  accept = IMAGE_TYPES,
  shape = 'square',
  label = 'Unggah gambar',
}: {
  value?: string | null
  onSelect: (file: File) => void
  onError: (message: string) => void
  uploading?: boolean
  maxSize?: number
  accept?: string[]
  shape?: 'square' | 'circle'
  label?: string
}) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const error = validateImageFile(file, maxSize, accept)
    if (error) {
      onError(error)
      return
    }
    onSelect(file)
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-dashed border-cream-200 bg-cream-50',
          shape === 'circle' ? 'rounded-full' : 'rounded-2xl',
        )}
      >
        {value ? (
          <ProductImage src={value} alt="Pratinjau" className="h-full w-full" />
        ) : (
          <ImagePlus aria-hidden className="h-7 w-7 text-ink-500/60" />
        )}
        {uploading ? (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Spinner />
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          onChange={handleChange}
          className="sr-only"
          disabled={uploading}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-cream-200 bg-white px-4 text-sm font-semibold text-ink-900 hover:border-leaf-300 hover:bg-leaf-50',
            uploading && 'pointer-events-none opacity-50',
          )}
        >
          <Upload className="h-4 w-4" />
          {value ? 'Ganti gambar' : label}
        </label>
        <p className="text-xs text-ink-500">JPG, PNG, atau GIF. Maks {Math.round(maxSize / 1024 / 1024)}MB.</p>
      </div>
    </div>
  )
}
