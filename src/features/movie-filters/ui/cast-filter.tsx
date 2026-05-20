import { useState } from 'react'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { User, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/ui/command'
import { Skeleton } from '@/shared/ui/skeleton'
import { Image } from '@/shared/ui/image'
import { usePersonSearch } from '@/entities/movie'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { getImageUrl } from '@/shared/api/tmdb-client'
import { cn } from '@/shared/lib/utils'

interface CastFilterProps {
  personId?: number
  personName?: string
  sidebar?: boolean
  onPersonChange: (id: number | undefined, name: string | undefined) => void
}

export function CastFilter({ personId, personName, sidebar = false, onPersonChange }: CastFilterProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const debouncedQuery = useDebounce(query, 400)
  const { data: personResults, isLoading, isError } = usePersonSearch(debouncedQuery)
  const people = personResults?.results.slice(0, 6) ?? []

  useEffect(() => {
    if (isError) toast.error('Falha ao buscar pessoas. Tente novamente.')
  }, [isError])

  if (personId) {
    return (
      <div className="space-y-1">
        {sidebar && <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-0.5">Elenco</p>}
        <div className={cn('inline-flex h-8 items-center gap-2 rounded-lg border border-primary bg-primary/10 px-2.5 text-sm', sidebar && 'w-full justify-between')}>
          <div className="flex items-center gap-1.5 truncate">
            <User className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate text-primary font-medium">{personName}</span>
          </div>
          <button className="cursor-pointer text-primary hover:text-primary/70 shrink-0" onClick={() => onPersonChange(undefined, undefined)}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {sidebar && <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-0.5">Elenco</p>}
      <Popover open={open} onOpenChange={(next) => { if (!next) setQuery(''); setOpen(next) }}>
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
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {query.length <= 1 && (
                <CommandEmpty className="text-muted-foreground text-xs">Digite ao menos 2 caracteres.</CommandEmpty>
              )}
              {query.length > 1 && isLoading && (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 px-1">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              )}
              {query.length > 1 && !isLoading && people.length === 0 && (
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
                        setQuery('')
                        setOpen(false)
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
    </div>
  )
}
