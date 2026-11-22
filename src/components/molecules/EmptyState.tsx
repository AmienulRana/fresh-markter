import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}>
      {icon ? (
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf-50 text-leaf-600 [&_svg]:h-7 [&_svg]:w-7">
          {icon}
        </span>
      ) : null}
      <div className="max-w-sm">
        <h3 className="text-base font-bold">{title}</h3>
        {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
