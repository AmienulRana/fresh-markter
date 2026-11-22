import { Package, ShieldCheck, ShoppingBasket, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Product, ProductVariant } from '@/types/catalog'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { PriceTag } from '@/components/molecules/PriceTag'
import { QuantityStepper } from '@/components/molecules/QuantityStepper'
import { VariantSelector } from '@/components/molecules/VariantSelector'
import { discountPercent, formatWeight } from '@/lib/utils'
import { MAX_ITEM_QUANTITY } from '@/lib/constants'
import { useAddToCartAction } from '@/lib/hooks/useAddToCartAction'

export function productVariants(product: Product): ProductVariant[] {
  const base: ProductVariant = {
    id: product.id,
    weight: product.weight,
    stock: product.stock,
    reguler_price: product.reguler_price,
    sale_price: product.sale_price,
    product_image: product.product_image,
  }
  return [base, ...(product.child ?? [])]
}

export function ProductInfo({
  product,
  compact,
  onVariantChange,
  onAdded,
}: {
  product: Product
  compact?: boolean
  onVariantChange?: (variant: ProductVariant) => void
  onAdded?: () => void
}) {
  const variants = useMemo(() => productVariants(product), [product])
  const [selected, setSelected] = useState<ProductVariant>(variants[0])
  const [quantity, setQuantity] = useState(1)
  const { addToCart, isPending } = useAddToCartAction()
  const discount = discountPercent(selected.reguler_price, selected.sale_price)
  const outOfStock = selected.stock !== undefined && selected.stock !== null && Number(selected.stock) <= 0
  const maxQuantity = outOfStock ? 1 : Math.min(MAX_ITEM_QUANTITY, Number(selected.stock) || MAX_ITEM_QUANTITY)
  const description = product.product_description || product.description

  function handleSelect(variant: ProductVariant) {
    setSelected(variant)
    setQuantity(1)
    onVariantChange?.(variant)
  }

  async function handleAdd() {
    const ok = await addToCart(selected.id, quantity, { openDrawer: !compact })
    if (ok) onAdded?.()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {product.category_name ? (
          <a
            href={product.category_slug ? `/shop?category=${encodeURIComponent(product.category_slug)}` : '/shop'}
            className="text-sm font-semibold tracking-wide text-leaf-700 uppercase hover:underline"
          >
            {product.category_name}
          </a>
        ) : null}
        <h1 className={compact ? 'text-2xl font-bold' : 'font-display text-3xl font-semibold sm:text-4xl'}>
          {product.product_name}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <PriceTag regular={selected.reguler_price} sale={selected.sale_price} size="lg" />
          {discount > 0 ? <Badge tone="accent">Hemat {discount}%</Badge> : null}
        </div>
        <p className="text-sm text-ink-500">
          {formatWeight(selected.weight, product.unit)}
          {selected.stock !== undefined && selected.stock !== null ? ` · Stok ${selected.stock}` : ''}
        </p>
      </div>

      <VariantSelector variants={variants} unit={product.unit} selectedId={selected.id} onSelect={handleSelect} />

      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} max={maxQuantity} disabled={outOfStock} />
        <Button size="lg" onClick={handleAdd} loading={isPending} disabled={outOfStock} className="flex-1 sm:flex-none">
          <ShoppingBasket className="h-5 w-5" />
          {outOfStock ? 'Stok habis' : 'Tambah ke keranjang'}
        </Button>
      </div>

      {description && !compact ? (
        <div className="border-t border-cream-200 pt-5">
          <h2 className="mb-2 text-base font-bold">Deskripsi</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line text-ink-700">{description}</p>
        </div>
      ) : null}
      {description && compact ? <p className="line-clamp-4 text-sm text-ink-700">{description}</p> : null}

      {!compact ? (
        <ul className="grid gap-3 rounded-2xl bg-leaf-50 p-4 text-sm text-ink-700 sm:grid-cols-3">
          <li className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-leaf-700" /> Dikirim di hari yang sama
          </li>
          <li className="flex items-center gap-2">
            <Package className="h-4 w-4 text-leaf-700" /> Dikemas higienis
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-leaf-700" /> Pembayaran aman
          </li>
        </ul>
      ) : null}
    </div>
  )
}
