import type { Ref, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { fieldBase, fieldTone } from './Input'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
  ref?: Ref<HTMLTextAreaElement>
}

export function Textarea({ className, invalid, ref, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(fieldBase, fieldTone(invalid), 'py-2.5', className)}
      {...props}
    />
  )
}
