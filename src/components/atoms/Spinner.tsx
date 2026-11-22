import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ className, label = 'Memuat' }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex">
      <LoaderCircle aria-hidden className={cn('h-5 w-5 animate-spin', className)} />
      <span className="sr-only">{label}</span>
    </span>
  )
}
