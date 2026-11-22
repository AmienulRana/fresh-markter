import { Eye, Plus } from 'lucide-react'
import type { Product } from '@/types/catalog'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { ProductImage } from '@/components/atoms/ProductImage'
import { PriceTag } from '@/components/molecules/PriceTag'
import { discountPercent, formatWeight } from '@/lib/utils'
import { useAddToCartAction } from '@/lib/hooks/useAddToCartAction'
import { openQuickView } from '@/stores/ui'

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const { addToCart, isPending, pendingId } = useAddToCartAction()
  const discount = discountPercent(product.reguler_price, product.sale_price)
  const href = `/shop/${product.id}`
  const loading = isPending && pendingId === product.id

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-cream-200/80 bg-white transition-shadow hover:shadow-card">
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        <a href={href} tabIndex={-1} aria-hidden>
          <ProductImage
            src={product.product_image}
            alt={product.product_name}
            loading={priority ? 'eager' : 'lazy'}
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
          />
        </a>
        {discount > 0 ? (
          <Badge tone="accent" className="absolute top-3 left-3">
            -{discount}%
          </Badge>
        ) : null}
        <button
          type="button"
          onClick={() => openQuickView(product.id)}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink-700 opacity-100 shadow-sm transition-opacity hover:text-leaf-700 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={`Lihat cepat ${product.product_name}`}
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category_name ? (
          <p className="text-xs font-semibold tracking-wide text-leaf-700 uppercase">{product.category_name}</p>
        ) : null}
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold">
          <a href={href} className="hover:text-leaf-700">
            {product.product_name}
          </a>
        </h3>
        {product.weight ? <p className="text-xs text-ink-500">{formatWeight(product.weight, product.unit)}</p> : null}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <PriceTag regular={product.reguler_price} sale={product.sale_price} size="sm" />
          <Button
            size="icon-sm"
            onClick={() => addToCart(product.id, 1)}
            loading={loading}
            aria-label={`Tambah ${product.product_name} ke keranjang`}
          >
            {loading ? null : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </article>
  )
}
