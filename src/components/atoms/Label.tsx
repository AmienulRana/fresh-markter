import type { LabelHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Label({
  className,
  required,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn('text-sm font-semibold text-ink-700', className)} {...props}>
      {children}
      {required ? <span className="ml-0.5 text-danger-500">*</span> : null}
    </label>
  )
}
