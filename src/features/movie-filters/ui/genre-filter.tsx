import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Check, ChevronsUpDown, X, RefreshCw } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { useGenres } from '@/entities/movie'
import { cn } from '@/shared/lib/utils'
import type { MovieFilters } from '../model/use-filter-bar'

interface GenreFilterProps {
  filters: MovieFilters
  onChange: (filters: MovieFilters) => void
  sidebar?: boolean
}

export function GenreFilter({ filters, onChange, sidebar = false }: GenreFilterProps) {
  const [open, setOpen] = useState(false)
  const [pendingIds, setPendingIds] = useState<string[]>(filters.genreIds)

  const { data: genres = [], isLoading, isError, refetch } = useGenres(open)

  useEffect(() => {
    if (isError) toast.error('Falha ao carregar gêneros. Tente novamente.')
  }, [isError])

  // Syncs local pending state when URL params change externally (reload, browser back/forward).
  // setState-in-effect is intentional here: recommended React pattern for resetting
  // derived state when a prop/external value changes (react.dev/learn/you-might-not-need-an-effect).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPendingIds(filters.genreIds) }, [filters.genreIds])

  const toggle = (id: string) => {
    setPendingIds((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id])
  }

  const apply = () => {
    onChange({ ...filters, genreIds: pendingIds })
    setOpen(false)
  }

  const label = () => {
    if (filters.genreIds.length === 0) return undefined
    if (filters.genreIds.length === 1) return genres.find((g) => g.id === Number(filters.genreIds[0]))?.name
    return `${filters.genreIds.length} gêneros`
  }

  return (
    <>
      <Popover open={open} onOpenChange={(next) => { if (next) setPendingIds(filters.genreIds); setOpen(next) }}>
        <PopoverTrigger
          className={cn(
            'inline-flex h-11 sm:h-8 items-center justify-between rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors hover:bg-accent focus:outline-none',
            sidebar ? 'w-full' : 'w-44',
            !label() && 'text-muted-foreground',
          )}
        >
          <span className="truncate">{label() ?? 'Gênero'}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar gênero..." />
            <CommandList className="max-h-52">
              {isLoading && (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-full" />
                  ))}
                </div>
              )}
              {isError && (
                <div className="px-3 py-4 text-center space-y-2">
                  <p className="text-xs font-medium text-destructive">Falha ao carregar gêneros</p>
                  <p className="text-xs text-muted-foreground">Verifique sua conexão</p>
                  <button
                    onClick={() => void refetch()}
                    className="flex items-center gap-1.5 mx-auto text-xs text-primary hover:underline"
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    Tentar novamente
                  </button>
                </div>
              )}
              {!isLoading && !isError && (
                <>
                  <CommandEmpty>Nenhum gênero encontrado.</CommandEmpty>
                  <CommandGroup>
                    {genres.map((g) => {
                      const id = String(g.id)
                      const selected = pendingIds.includes(id)
                      return (
                        <CommandItem key={g.id} value={g.name} onSelect={() => toggle(id)}>
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
            <button onClick={apply} aria-label={`Aplicar ${pendingIds.length} gênero${pendingIds.length !== 1 ? 's' : ''} selecionado${pendingIds.length !== 1 ? 's' : ''}`} className="flex-1 rounded-md bg-primary min-h-11 sm:min-h-8 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
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
    </>
  )
}
