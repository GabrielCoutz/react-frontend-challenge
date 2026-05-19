import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/shared/ui/input'
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

  const handleClear = () => {
    setValue('')
    onSearch('')
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        className="pl-9 pr-8"
        placeholder="Buscar filmes..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
