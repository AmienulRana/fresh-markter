import { cn, discountPercent, formatRupiah } from '@/lib/utils'

export function PriceTag({
  regular,
  sale,
  size = 'md',
  className,
}: {
  regular: number
  sale?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const hasDiscount = discountPercent(regular, sale ?? 0) > 0
  const current = hasDiscount ? (sale ?? regular) : regular || sale || 0
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span
        className={cn(
          'font-bold text-ink-900 tabular-nums',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-3xl',
        )}
      >
        {formatRupiah(current)}
      </span>
      {hasDiscount ? (
        <span className={cn('text-ink-500 tabular-nums line-through', size === 'lg' ? 'text-base' : 'text-xs')}>
          {formatRupiah(regular)}
        </span>
      ) : null}
    </div>
  )
}
