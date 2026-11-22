import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled,
  size = 'md',
  label = 'Jumlah',
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  size?: 'sm' | 'md'
  label?: string
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next))
  const button = cn(
    'flex items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-leaf-50 hover:text-leaf-700 disabled:opacity-40',
    size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
  )
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-cream-200 bg-white p-0.5',
        disabled && 'opacity-60',
      )}
    >
      <button
        type="button"
        className={button}
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label="Kurangi jumlah"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(event) => {
          const parsed = Number(event.target.value)
          if (Number.isFinite(parsed)) onChange(clamp(parsed))
        }}
        className={cn(
          'bg-transparent text-center font-semibold tabular-nums focus:outline-none',
          size === 'sm' ? 'w-8 text-sm' : 'w-10 text-base',
        )}
      />
      <button
        type="button"
        className={button}
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label="Tambah jumlah"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
