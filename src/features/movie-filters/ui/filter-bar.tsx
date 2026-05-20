import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, X, User, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Slider } from '@/shared/ui/slider'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { useGenres, useCertifications, usePersonSearch } from '@/entities/movie'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { getImageUrl } from '@/shared/api/tmdb-client'
import { Image } from '@/shared/ui/image'
import { cn } from '@/shared/lib/utils'

export interface MovieFilters {
  genreIds: string[]
  year: number | undefined
  minRating: number | undefined
  certification: string | undefined
}

interface FilterBarProps {
  onClearQuery?: () => void
  filters: MovieFilters
  onChange: (filters: MovieFilters) => void
  sidebar?: boolean
  personId?: number
  personName?: string
  onPersonChange?: (id: number | undefined, name: string | undefined) => void
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i)
const EMPTY_FILTERS: MovieFilters = { genreIds: [], year: undefined, minRating: undefined, certification: undefined }

export function FilterBar({ filters, onChange, sidebar = false, personId, personName, onPersonChange, onClearQuery }: FilterBarProps) {
  const [genreOpen, setGenreOpen] = useState(false)
  const { data: genres = [], isLoading: genresLoading, isError: genresError, refetch: refetchGenres } = useGenres(genreOpen)

  useEffect(() => {
    if (genresError) toast.error('Falha ao carregar gêneros. Tente novamente.')
  }, [genresError])
  const [personOpen, setPersonOpen] = useState(false)
  const [personQuery, setPersonQuery] = useState('')
  const [pendingIds, setPendingIds] = useState<string[]>(filters.genreIds)
  const [ratingDisplay, setRatingDisplay] = useState(filters.minRating ?? 0)

  // Syncs local pending state when URL params change externally (reload, browser back/forward).
  // setState-in-effect is intentional here: this is the recommended React pattern for resetting
  // derived state when a prop/external value changes (react.dev/learn/you-might-not-need-an-effect).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPendingIds(filters.genreIds) }, [filters.genreIds])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setRatingDisplay(filters.minRating ?? 0) }, [filters.minRating])

  const debouncedPersonQuery = useDebounce(personQuery, 400)
  const { data: personResults, isLoading: personLoading, isError: personError } = usePersonSearch(debouncedPersonQuery)
  const people = personResults?.results.slice(0, 6) ?? []

  useEffect(() => {
    if (personError) toast.error('Falha ao buscar pessoas. Tente novamente.')
  }, [personError])

  const [certOpen, setCertOpen] = useState(false)
  const { data: certifications = [] } = useCertifications(certOpen)

  const hasActiveFilters = filters.genreIds.length > 0 || !!filters.year || !!filters.minRating || !!filters.certification || !!personId

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
    onPersonChange?.(undefined, undefined)
    onClearQuery?.()
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

      {/* Pessoa do elenco (opcional) */}
      {onPersonChange && (
        <div className="space-y-1">
          {sidebar && <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-0.5">Elenco</p>}
          {personId ? (
            <div className={cn('inline-flex h-8 items-center gap-2 rounded-lg border border-primary bg-primary/10 px-2.5 text-sm', sidebar && 'w-full justify-between')}>
              <div className="flex items-center gap-1.5 truncate">
                <User className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate text-primary font-medium">{personName}</span>
              </div>
              <button className="cursor-pointer text-primary hover:text-primary/70 shrink-0" onClick={() => onPersonChange(undefined, undefined)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Popover open={personOpen} onOpenChange={(open) => { if (!open) setPersonQuery(''); setPersonOpen(open) }}>
              <PopoverTrigger
                className={cn(
                  'inline-flex h-11 sm:h-8 items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors hover:bg-accent focus:outline-none text-muted-foreground',
                  sidebar ? 'w-full' : 'w-44',
                )}
              >
                <span>Elenco</span>
                <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Buscar ator/diretora..."
                    value={personQuery}
                    onValueChange={setPersonQuery}
                  />
                  <CommandList>
                    {personQuery.length <= 1 && (
                      <CommandEmpty className="text-muted-foreground text-xs">Digite ao menos 2 caracteres.</CommandEmpty>
                    )}
                    {personQuery.length > 1 && personLoading && (
                      <div className="space-y-2 p-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-2 px-1">
                            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                            <Skeleton className="h-4 flex-1" />
                          </div>
                        ))}
                      </div>
                    )}
                    {personQuery.length > 1 && !personLoading && people.length === 0 && (
                      <CommandEmpty>Nenhuma pessoa encontrada.</CommandEmpty>
                    )}
                    <CommandGroup>
                      {people.map((p) => {
                        const photo = getImageUrl(p.profile_path, 'w45')
                        return (
                          <CommandItem
                            key={p.id}
                            value={String(p.id)}
                            onSelect={() => {
                              onPersonChange(p.id, p.name)
                              setPersonQuery('')
                              setPersonOpen(false)
                            }}
                          >
                            <div className="relative mr-2 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                              <Image src={photo} alt={p.name} className="h-full w-full object-cover" fallbackClassName="h-full w-full" />
                            </div>
                            <span className="text-sm truncate">{p.name}</span>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}

      {/* Gêneros */}
      <Popover open={genreOpen} onOpenChange={(open) => {
        if (open) setPendingIds(filters.genreIds)
        setGenreOpen(open)
      }}>
        <PopoverTrigger
          className={cn(
            'inline-flex h-11 sm:h-8 items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors hover:bg-accent focus:outline-none',
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
              {genresLoading && (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-full" />
                  ))}
                </div>
              )}
              {genresError && (
                <div className="px-3 py-4 text-center space-y-2">
                  <p className="text-xs font-medium text-destructive">Falha ao carregar gêneros</p>
                  <p className="text-xs text-muted-foreground">Verifique sua conexão</p>
                  <button
                    onClick={() => void refetchGenres()}
                    className="flex items-center gap-1.5 mx-auto text-xs text-primary hover:underline"
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    Tentar novamente
                  </button>
                </div>
              )}
              {!genresLoading && !genresError && (
                <>
                  <CommandEmpty>Nenhum gênero encontrado.</CommandEmpty>
                  <CommandGroup>
                    {genres.map((g) => {
                      const id = String(g.id)
                      const selected = pendingIds.includes(id)
                      return (
                        <CommandItem key={g.id} value={g.name} onSelect={() => toggleGenre(id)}>
                          <div className={cn('mr-2 flex h-4 w-4 items-center justify-center rounded border border-border', selected && 'bg-primary border-primary')}>
                            {selected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          {g.name}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
          <div className="border-t border-border p-2 flex gap-2">
            <button onClick={() => setPendingIds([])} aria-label="Limpar seleção de gêneros" className="flex-1 rounded-md min-h-11 sm:min-h-8 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              Limpar
            </button>
            <button onClick={applyGenres} aria-label={`Aplicar ${pendingIds.length} gênero${pendingIds.length !== 1 ? 's' : ''} selecionado${pendingIds.length !== 1 ? 's' : ''}`} className="flex-1 rounded-md bg-primary min-h-11 sm:min-h-8 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Aplicar {pendingIds.length > 0 && `(${pendingIds.length})`}
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {sidebar && filters.genreIds.length > 0 && genres.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.genreIds.map((id) => {
            const name = genres.find((g) => String(g.id) === id)?.name
            if (!name) return null
            return (
              <Badge key={id} variant="secondary" className="text-xs gap-1 pr-1">
                {name}
                <button
                  className="cursor-pointer"
                  aria-label={`Remover gênero ${name}`}
                  onClick={() => onChange({ ...filters, genreIds: filters.genreIds.filter((g) => g !== id) })}
                >
                  <X className="h-2.5 w-2.5" aria-hidden="true" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Ano */}
      <Select
        key={`year-${filters.year ?? 'none'}`}
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

      {/* Classificação indicativa */}
      <Select
        key={`cert-${filters.certification ?? 'none'}`}
        open={certOpen}
        onOpenChange={setCertOpen}
        value={filters.certification ?? undefined}
        onValueChange={(v) => onChange({ ...filters, certification: v === 'all' || !v ? undefined : v })}
      >
        <SelectTrigger className={sidebar ? 'w-full' : 'w-40'}>
          <SelectValue placeholder="Classificação">
            {filters.certification ?? undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Qualquer classificação</SelectItem>
          {certifications.map((c) => (
            <SelectItem key={c.certification} value={c.certification}>
              {c.certification}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Nota mínima */}
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
          aria-label="Nota mínima"
          aria-valuetext={ratingDisplay > 0 ? `${ratingDisplay} de 10` : 'Sem filtro de nota'}
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
        <button onClick={handleClearAll} className="flex min-h-11 sm:min-h-0 items-center gap-1.5 px-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
          <X className="h-3 w-3" aria-hidden="true" />
          Limpar filtros
        </button>
      )}
    </div>
  )
}
