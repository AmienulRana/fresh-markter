import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ProductImage({
  src,
  alt,
  className,
  loading = 'lazy',
}: {
  src?: string | null
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <span className={cn('flex items-center justify-center bg-cream-100 text-ink-500/60', className)}>
        <ImageOff aria-hidden className="h-1/4 max-h-10 w-1/4 max-w-10" />
        <span className="sr-only">{alt}</span>
      </span>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  )
}
