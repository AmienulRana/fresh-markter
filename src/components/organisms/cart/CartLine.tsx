import { Trash } from 'lucide-react'
import type { CartItem } from '@/types/order'
import { ProductImage } from '@/components/atoms/ProductImage'
import { QuantityStepper } from '@/components/molecules/QuantityStepper'
import { formatRupiah, formatWeight } from '@/lib/utils'
import { MAX_ITEM_QUANTITY } from '@/lib/constants'

export function CartLine({
  item,
  onQuantityChange,
  onRemove,
  busy,
  compact,
}: {
  item: CartItem
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
  busy?: boolean
  compact?: boolean
}) {
  return (
    <li className="flex gap-4 py-4">
      <a href={`/shop/${item.id}`} className="shrink-0">
        <ProductImage
          src={item.product_image}
          alt={item.product_name}
          className={compact ? 'h-16 w-16 rounded-xl' : 'h-20 w-20 rounded-2xl'}
        />
      </a>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <a href={`/shop/${item.id}`} className="line-clamp-2 text-sm font-semibold hover:text-leaf-700">
              {item.product_name}
            </a>
            <p className="text-xs text-ink-500">
              {formatWeight(item.weight, item.unit)}
              {item.weight ? ' · ' : ''}
              {formatRupiah(item.sale_price)}
            </p>
          </div>
          <p className="text-sm font-bold tabular-nums">{formatRupiah(item.sale_price * item.quantity)}</p>
        </div>
        <div className="flex items-center justify-between">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={Math.max(MAX_ITEM_QUANTITY, item.quantity)}
            onChange={onQuantityChange}
            disabled={busy}
            label={`Jumlah ${item.product_name}`}
          />
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-danger-600 hover:bg-danger-50 disabled:opacity-50"
          >
            <Trash className="h-3.5 w-3.5" />
            Hapus
          </button>
        </div>
      </div>
    </li>
  )
}
