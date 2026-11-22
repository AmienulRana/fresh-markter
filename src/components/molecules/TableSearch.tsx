import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/atoms/Input'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'

export function TableSearch({
  onSearch,
  placeholder = 'Cari…',
  label = 'Cari data',
  defaultValue = '',
}: {
  onSearch: (value: string) => void
  placeholder?: string
  label?: string
  defaultValue?: string
}) {
  const [value, setValue] = useState(defaultValue)
  const debounced = useDebouncedValue(value.trim(), 400)

  useEffect(() => {
    onSearch(debounced)
  }, [debounced])

  return (
    <div className="w-full sm:w-72">
      <label className="sr-only" htmlFor="table-search">
        {label}
      </label>
      <Input
        id="table-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        leading={<Search className="h-4 w-4" />}
      />
    </div>
  )
}
