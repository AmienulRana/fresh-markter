import { useStore } from '@nanostores/react'
import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Skeleton } from '@/components/atoms/Skeleton'
import { Modal } from '@/components/molecules/Modal'
import { useProduct } from '@/lib/queries/catalog'
import { getErrorMessage } from '@/lib/api/errors'
import { $quickViewProductId, closeQuickView } from '@/stores/ui'
import { ProductGallery } from './ProductGallery'
import { ProductInfo } from './ProductInfo'

export function QuickViewModal() {
  const productId = useStore($quickViewProductId)
  const { data: product, isPending, isError, error } = useProduct(productId)
  const [image, setImage] = useState<string | null>(null)

  return (
    <Modal open={productId !== null} onClose={closeQuickView} size="xl">
      {isPending ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      ) : isError || !product ? (
        <p className="py-10 text-center text-sm text-danger-600">{getErrorMessage(error, 'Produk tidak ditemukan.')}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <ProductGallery product={product} activeImage={image} />
          <div className="flex flex-col gap-4">
            <ProductInfo
              key={product.id}
              product={product}
              compact
              onVariantChange={(variant) => setImage(variant.product_image || variant.image || null)}
              onAdded={closeQuickView}
            />
            <Button href={`/shop/${product.id}`} variant="outline">
              Lihat detail produk
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
