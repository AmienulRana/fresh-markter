import type { ReactNode } from 'react'
import { Card } from '@/components/atoms/Card'
import { Skeleton } from '@/components/atoms/Skeleton'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  icon,
  tone = 'leaf',
  loading,
  href,
}: {
  label: string
  value: ReactNode
  icon: ReactNode
  tone?: 'leaf' | 'carrot' | 'sun' | 'info'
  loading?: boolean
  href?: string
}) {
  const content = (
    <Card className={cn('flex items-center gap-4 p-5', href && 'transition-shadow hover:shadow-pop')}>
      <span
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
          tone === 'leaf' && 'bg-leaf-50 text-leaf-700',
          tone === 'carrot' && 'bg-carrot-50 text-carrot-600',
          tone === 'sun' && 'bg-sun-100 text-sun-600',
          tone === 'info' && 'bg-info-50 text-info-500',
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-ink-500">{label}</p>
        {loading ? <Skeleton className="mt-1 h-7 w-16" /> : <p className="text-2xl font-bold tabular-nums">{value}</p>}
      </div>
    </Card>
  )
  return href ? <a href={href}>{content}</a> : content
}
