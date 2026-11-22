import { useEffect, useMemo, useState } from 'react'
import type { Product } from '@/types/catalog'
import { ProductImage } from '@/components/atoms/ProductImage'
import { cn } from '@/lib/utils'

export function productImages(product: Product) {
  const sources = [product.product_image, ...(product.child ?? []).map((child) => child.product_image || child.image)]
  return [...new Set(sources.filter((src): src is string => Boolean(src)))]
}

export function ProductGallery({ product, activeImage }: { product: Product; activeImage?: string | null }) {
  const images = useMemo(() => productImages(product), [product])
  const [current, setCurrent] = useState(images[0] ?? '')

  useEffect(() => {
    if (activeImage) setCurrent(activeImage)
  }, [activeImage])

  useEffect(() => {
    setCurrent(images[0] ?? '')
  }, [images])

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-3xl border border-cream-200 bg-white">
        <ProductImage src={current} alt={product.product_name} loading="eager" className="h-full w-full" />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setCurrent(src)}
              aria-label={`Lihat gambar ${index + 1}`}
              aria-pressed={current === src}
              className={cn(
                'h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition-colors',
                current === src ? 'border-leaf-500' : 'border-transparent hover:border-cream-200',
              )}
            >
              <ProductImage src={src} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
