import type { Product } from '@/types/catalog'
import { Skeleton } from '@/components/atoms/Skeleton'
import { cn } from '@/lib/utils'
import { ProductCard } from './ProductCard'

export function ProductGrid({
  products,
  loading,
  skeletonCount = 10,
  className,
}: {
  products: Product[]
  loading?: boolean
  skeletonCount?: number
  className?: string
}) {
  const grid = cn('grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5', className)
  if (loading) {
    return (
      <div className={grid}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-card border border-cream-200 bg-white">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className={grid}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  )
}
