import { useEffect, useState } from 'react'
import { formatRupiah } from '@/lib/utils'

export function PriceRangeInput({
  min,
  max,
  step,
  value,
  onCommit,
}: {
  min: number
  max: number
  step: number
  value: [number, number]
  onCommit: (value: [number, number]) => void
}) {
  const [draft, setDraft] = useState<[number, number]>(value)

  useEffect(() => {
    setDraft(value)
  }, [value[0], value[1]])

  const left = ((draft[0] - min) / (max - min)) * 100
  const right = ((draft[1] - min) / (max - min)) * 100
  const commit = () => onCommit(draft)

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-cream-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-leaf-500"
          style={{ left: `${left}%`, right: `${100 - right}%` }}
        />
        <input
          type="range"
          aria-label="Harga minimum"
          min={min}
          max={max}
          step={step}
          value={draft[0]}
          onChange={(event) => setDraft([Math.min(Number(event.target.value), draft[1] - step), draft[1]])}
          onPointerUp={commit}
          onKeyUp={commit}
          className="range-thumb absolute inset-0 h-5 w-full"
        />
        <input
          type="range"
          aria-label="Harga maksimum"
          min={min}
          max={max}
          step={step}
          value={draft[1]}
          onChange={(event) => setDraft([draft[0], Math.max(Number(event.target.value), draft[0] + step)])}
          onPointerUp={commit}
          onKeyUp={commit}
          className="range-thumb absolute inset-0 h-5 w-full"
        />
      </div>
      <div className="flex items-center justify-between text-sm font-semibold text-ink-700 tabular-nums">
        <span>{formatRupiah(draft[0])}</span>
        <span className="text-ink-500">–</span>
        <span>{formatRupiah(draft[1])}</span>
      </div>
    </div>
  )
}
