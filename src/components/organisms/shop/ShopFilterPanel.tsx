import type { Category } from '@/types/catalog'
import { Button } from '@/components/atoms/Button'
import { ProductImage } from '@/components/atoms/ProductImage'
import { PriceRangeInput } from '@/components/molecules/PriceRangeInput'
import { PRICE_RANGE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ShopFilters } from '@/stores/shop-filters'

export function ShopFilterPanel({
  categories,
  filters,
  onChange,
  onReset,
}: {
  categories: Category[]
  filters: ShopFilters
  onChange: (patch: Partial<ShopFilters>) => void
  onReset: () => void
}) {
  const priceValue: [number, number] = [filters.minPrice ?? PRICE_RANGE.min, filters.maxPrice ?? PRICE_RANGE.defaultMax]
  const item = 'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors'

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-sm font-bold tracking-wide text-ink-500 uppercase">Kategori</h2>
        <ul className="flex flex-col gap-1">
          <li>
            <button
              type="button"
              onClick={() => onChange({ category: '' })}
              aria-pressed={!filters.category}
              className={cn(item, !filters.category ? 'bg-leaf-50 font-semibold text-leaf-700' : 'hover:bg-cream-100')}
            >
              Semua kategori
            </button>
          </li>
          {categories.map((category) => {
            const active = filters.category === category.slug
            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => onChange({ category: category.slug })}
                  aria-pressed={active}
                  className={cn(item, active ? 'bg-leaf-50 font-semibold text-leaf-700' : 'hover:bg-cream-100')}
                >
                  <ProductImage src={category.icon} alt="" className="h-7 w-7 rounded-lg" />
                  {category.name}
                </button>
              </li>
            )
          })}
        </ul>
      </section>
      <section>
        <h2 className="mb-4 text-sm font-bold tracking-wide text-ink-500 uppercase">Rentang harga</h2>
        <PriceRangeInput
          min={PRICE_RANGE.min}
          max={PRICE_RANGE.max}
          step={PRICE_RANGE.step}
          value={priceValue}
          onCommit={([minPrice, maxPrice]) => onChange({ minPrice, maxPrice })}
        />
      </section>
      <Button variant="outline" onClick={onReset}>
        Reset filter
      </Button>
    </div>
  )
}
