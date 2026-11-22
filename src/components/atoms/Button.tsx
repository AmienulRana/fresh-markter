import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

const VARIANTS = {
  primary: 'bg-leaf-600 text-white hover:bg-leaf-700 active:bg-leaf-800 shadow-sm',
  accent: 'bg-carrot-500 text-white hover:bg-carrot-600 active:bg-carrot-700 shadow-sm',
  outline: 'border border-cream-200 bg-white text-ink-900 hover:border-leaf-300 hover:bg-leaf-50',
  soft: 'bg-leaf-50 text-leaf-700 hover:bg-leaf-100',
  ghost: 'text-ink-700 hover:bg-cream-100 hover:text-ink-900',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 shadow-sm',
  'danger-soft': 'bg-danger-50 text-danger-600 hover:bg-danger-500 hover:text-white',
} as const

const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 p-0',
  'icon-sm': 'h-8 w-8 p-0',
} as const

export type ButtonVariant = keyof typeof VARIANTS
export type ButtonSize = keyof typeof SIZES

interface BaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  block?: boolean
  children?: ReactNode
  className?: string
}

type ButtonAsButton = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type ButtonAsLink = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export type ButtonProps = ButtonAsButton | ButtonAsLink

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  block,
  className,
}: Pick<BaseProps, 'variant' | 'size' | 'block' | 'className'>) {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-full font-semibold whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    block && 'w-full',
    className,
  )
}

export function Button(props: ButtonProps) {
  const { variant, size, loading, block, className, children, ...rest } = props
  const classes = buttonClasses({ variant, size, block, className })

  if (typeof rest.href === 'string') {
    return (
      <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={classes}>
        {children}
      </a>
    )
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button
      type="button"
      {...buttonProps}
      disabled={buttonProps.disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
    >
      {loading ? <Spinner className="h-4 w-4" /> : null}
      {children}
    </button>
  )
}
