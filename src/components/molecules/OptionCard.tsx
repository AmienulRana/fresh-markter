import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function OptionCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  icon,
  aside,
}: {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  title: string
  description?: string
  icon?: ReactNode
  aside?: ReactNode
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4 transition-colors',
        checked ? 'border-leaf-500 ring-4 ring-leaf-100' : 'border-cream-200 hover:border-leaf-300',
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-1 h-4 w-4 accent-leaf-600"
      />
      {icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700">{icon}</span>
      ) : null}
      <span className="flex-1">
        <span className="block text-sm font-bold text-ink-900">{title}</span>
        {description ? <span className="mt-0.5 block text-sm text-ink-500">{description}</span> : null}
      </span>
      {aside ? <span className="text-sm font-semibold text-ink-900">{aside}</span> : null}
    </label>
  )
}
