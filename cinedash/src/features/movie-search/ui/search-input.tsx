import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/shared/hooks/use-debounce'

interface SearchInputProps {
  onSearch: (query: string) => void
  initialValue?: string
}

export function SearchInput({ onSearch, initialValue = '' }: SearchInputProps) {
  const [value, setValue] = useState(initialValue)
  const debounced = useDebounce(value, 400)

  useEffect(() => {
    onSearch(debounced)
  }, [debounced, onSearch])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder="Buscar filmes..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}
