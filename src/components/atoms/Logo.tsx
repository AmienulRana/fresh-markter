import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden className={cn('h-10 w-10', className)}>
      <rect width="40" height="40" rx="12" fill="#2E7D4F" />
      <path d="M20 14.5c0-4.2 3-7.2 7.6-7.6.3 4.6-2.8 7.6-7.6 7.6Z" fill="#AFD9BD" />
      <path d="M20 14.5c-.2-2.6-1.4-4.6-3.6-5.8" stroke="#AFD9BD" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 16h19l-1.9 13.3a3 3 0 0 1-3 2.6h-9.2a3 3 0 0 1-3-2.6L10.5 16Z" fill="#FBF8F2" />
      <path d="M15.5 21v5.5M20 21v5.5M24.5 21v5.5" stroke="#2E7D4F" strokeWidth="2" strokeLinecap="round" />
      <circle cx="30.5" cy="11" r="2.5" fill="#F0773A" />
    </svg>
  )
}

export function Logo({
  variant = 'full',
  tone = 'default',
  className,
}: {
  variant?: 'full' | 'mark'
  tone?: 'default' | 'light'
  className?: string
}) {
  if (variant === 'mark') return <LogoMark className={className} />
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="h-9 w-9" />
      <span className="font-display text-[1.45rem] leading-none font-semibold tracking-tight">
        <span className={tone === 'light' ? 'text-leaf-200' : 'text-leaf-600'}>fresh</span>
        <span className={tone === 'light' ? 'text-white' : 'text-ink-900'}>market</span>
      </span>
      <span className="sr-only">Fresh Market</span>
    </span>
  )
}
