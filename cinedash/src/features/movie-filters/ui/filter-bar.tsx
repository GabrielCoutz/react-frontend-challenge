import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { useGenres } from '@/entities/movie/api/use-genres'
import { cn } from '@/lib/utils'

export interface MovieFilters {
  genreIds: string[]
  year: number | undefined
  minRating: number | undefined
}

interface FilterBarProps {
  filters: MovieFilters
  onChange: (filters: MovieFilters) => void
  sidebar?: boolean
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i)
const EMPTY_FILTERS: MovieFilters = { genreIds: [], year: undefined, minRating: undefined }

export function FilterBar({ filters, onChange, sidebar = false }: FilterBarProps) {
  const { data: genres = [] } = useGenres()
  const [genreOpen, setGenreOpen] = useState(false)
  const [pendingIds, setPendingIds] = useState<string[]>(filters.genreIds)
  const [ratingDisplay, setRatingDisplay] = useState(filters.minRating ?? 0)

  const hasActiveFilters = filters.genreIds.length > 0 || !!filters.year || !!filters.minRating

  const toggleGenre = (id: string) => {
    setPendingIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    )
  }

  const applyGenres = () => {
    onChange({ ...filters, genreIds: pendingIds })
    setGenreOpen(false)
  }

  const handleRatingCommit = (raw: number | readonly number[]) => {
    const v = Array.isArray(raw) ? raw[0] : raw
    const value = v ?? 0
    setRatingDisplay(value)
    onChange({ ...filters, minRating: value > 0 ? value : undefined })
  }

  const handleClearAll = () => {
    setPendingIds([])
    setRatingDisplay(0)
    onChange(EMPTY_FILTERS)
  }

  const genreLabel = () => {
    if (filters.genreIds.length === 0) return undefined
    if (filters.genreIds.length === 1) {
      return genres.find((g) => g.id === Number(filters.genreIds[0]))?.name
    }
    return `${filters.genreIds.length} gêneros`
  }

  return (
    <div className={sidebar ? 'flex flex-col gap-4' : 'flex flex-wrap items-end gap-4'}>

      {/* Gêneros — multi-select com checkboxes */}
      <Popover open={genreOpen} onOpenChange={(open) => {
        if (open) setPendingIds(filters.genreIds)
        setGenreOpen(open)
      }}>
        <PopoverTrigger
          className={cn(
            'inline-flex h-8 items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors hover:bg-accent focus:outline-none',
            sidebar ? 'w-full' : 'w-44',
            !genreLabel() && 'text-muted-foreground',
          )}
        >
          <span className="truncate">{genreLabel() ?? 'Gênero'}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar gênero..." />
            <CommandList className="max-h-52">
              <CommandEmpty>Nenhum gênero encontrado.</CommandEmpty>
              <CommandGroup>
                {genres.map((g) => {
                  const id = String(g.id)
                  const selected = pendingIds.includes(id)
                  return (
                    <CommandItem key={g.id} value={g.name} onSelect={() => toggleGenre(id)}>
                      <div className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded border border-border',
                        selected && 'bg-primary border-primary',
                      )}>
                        {selected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {g.name}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="border-t border-border p-2 flex gap-2">
            <button
              onClick={() => setPendingIds([])}
              className="flex-1 rounded-md py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={applyGenres}
              className="flex-1 rounded-md bg-primary py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Aplicar {pendingIds.length > 0 && `(${pendingIds.length})`}
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Badges dos gêneros selecionados (sidebar) */}
      {sidebar && filters.genreIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.genreIds.map((id) => {
            const name = genres.find((g) => String(g.id) === id)?.name
            return (
              <Badge key={id} variant="secondary" className="text-xs gap-1 pr-1">
                {name}
                <button className="cursor-pointer" onClick={() => onChange({ ...filters, genreIds: filters.genreIds.filter((g) => g !== id) })}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Ano */}
      <Select
        value={filters.year ? String(filters.year) : undefined}
        onValueChange={(v) => onChange({ ...filters, year: v === 'clear' || !v ? undefined : Number(v) })}
      >
        <SelectTrigger className={sidebar ? 'w-full' : 'w-36'}>
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="clear">Qualquer ano</SelectItem>
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Nota mínima — Slider */}
      <div className={sidebar ? 'space-y-2' : 'flex flex-col gap-1 min-w-40'}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Nota mínima</span>
          <span className="font-mono text-xs font-bold text-primary">
            {ratingDisplay > 0 ? `★ ${ratingDisplay}` : '—'}
          </span>
        </div>
        <Slider
          min={0} max={10} step={0.5}
          value={[ratingDisplay]}
          onValueChange={(raw) => {
            const v = Array.isArray(raw) ? raw[0] : raw
            setRatingDisplay(v ?? 0)
          }}
          onValueCommitted={handleRatingCommit}
          className="w-full"
        />
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>0</span><span>10</span>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-3 w-3" />
          Limpar filtros
        </button>
      )}
    </div>
  )
}
