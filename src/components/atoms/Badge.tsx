import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const TONES = {
  neutral: 'bg-cream-100 text-ink-700',
  success: 'bg-leaf-50 text-leaf-700 ring-leaf-200',
  warning: 'bg-sun-100 text-sun-600 ring-sun-400/40',
  danger: 'bg-danger-50 text-danger-600 ring-danger-500/20',
  info: 'bg-info-50 text-info-500 ring-info-500/20',
  accent: 'bg-carrot-500 text-white',
} as const

export type BadgeTone = keyof typeof TONES

export function Badge({ tone = 'neutral', className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-transparent ring-inset',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
