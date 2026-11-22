import type { ProductVariant } from '@/types/catalog'
import { cn, formatWeight } from '@/lib/utils'

export function VariantSelector({
  variants,
  unit,
  selectedId,
  onSelect,
}: {
  variants: ProductVariant[]
  unit: string
  selectedId: number
  onSelect: (variant: ProductVariant) => void
}) {
  if (variants.length <= 1) return null
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink-700">Pilih ukuran</legend>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const active = variant.id === selectedId
          return (
            <button
              key={variant.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(variant)}
              className={cn(
                'h-10 rounded-full border px-4 text-sm font-semibold transition-colors',
                active
                  ? 'border-leaf-600 bg-leaf-600 text-white'
                  : 'border-cream-200 bg-white text-ink-700 hover:border-leaf-300',
              )}
            >
              {formatWeight(variant.weight, unit) || 'Default'}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
