import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils'

export function SearchBar({
  defaultValue = '',
  placeholder = 'Cari sayur, buah, bumbu…',
  onSearch,
  className,
}: {
  defaultValue?: string
  placeholder?: string
  onSearch: (value: string) => void
  className?: string
}) {
  const [value, setValue] = useState(defaultValue)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <label htmlFor="site-search" className="sr-only">
        Cari produk
      </label>
      <input
        id="site-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-cream-200 bg-cream-50 pr-12 pl-5 text-sm transition-colors placeholder:text-ink-500/70 focus:border-leaf-500 focus:bg-white focus:ring-4 focus:ring-leaf-100 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Cari"
        className="absolute top-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-leaf-600 text-white hover:bg-leaf-700"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  )
}
