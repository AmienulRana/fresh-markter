import type { InputHTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '@/lib/utils'

export const fieldBase =
  'w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-500/70 transition-colors focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-cream-100'

export function fieldTone(invalid?: boolean) {
  return invalid
    ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-50'
    : 'border-cream-200 focus:border-leaf-500 focus:ring-leaf-100'
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
  leading?: ReactNode
  trailing?: ReactNode
  ref?: Ref<HTMLInputElement>
}

export function Input({ className, invalid, leading, trailing, ref, ...props }: InputProps) {
  const input = (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, fieldTone(invalid), 'h-11', leading && 'pl-10', trailing && 'pr-11', className)}
      {...props}
    />
  )
  if (!leading && !trailing) return input
  return (
    <div className="relative">
      {leading ? (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-500">{leading}</span>
      ) : null}
      {input}
      {trailing ? <span className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</span> : null}
    </div>
  )
}
