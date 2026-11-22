import { PackageOpen } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '@/types/catalog'
import { Button } from '@/components/atoms/Button'
import { Skeleton } from '@/components/atoms/Skeleton'
import { Breadcrumb } from '@/components/molecules/Breadcrumb'
import { EmptyState } from '@/components/molecules/EmptyState'
import { withQuery } from '@/lib/queries/client'
import { useProduct } from '@/lib/queries/catalog'
import { ProductGallery } from './ProductGallery'
import { ProductInfo } from './ProductInfo'

function ProductDetailViewBase({ productId, initialData }: { productId: string; initialData?: Product | null }) {
  const { data: product, isPending, isError } = useProduct(productId, initialData)
  const [image, setImage] = useState<string | null>(null)

  if (isPending) {
    return (
      <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<PackageOpen />}
          title="Produk tidak ditemukan"
          description="Produk ini mungkin sudah tidak tersedia."
          action={<Button href="/shop">Kembali belanja</Button>}
        />
      </div>
    )
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Belanja', href: '/shop' },
          ...(product.category_name
            ? [{ label: product.category_name, href: `/shop?category=${encodeURIComponent(product.category_slug ?? '')}` }]
            : []),
          { label: product.product_name },
        ]}
      />
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery product={product} activeImage={image} />
        <ProductInfo
          product={product}
          onVariantChange={(variant) => setImage(variant.product_image || variant.image || null)}
        />
      </div>
    </div>
  )
}

export const ProductDetailView = withQuery(ProductDetailViewBase)
