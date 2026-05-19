import { useMemo, useState } from 'react'
import { usePageTitle } from '@/shared/hooks/use-page-title'
import { SlidersHorizontal } from 'lucide-react'
import { useWatchlistStore } from '@/features/watchlist'
import { WatchlistTable } from '@/widgets/movie-table'
import { FilterBar, type MovieFilters } from '@/features/movie-filters'
import { Input } from '@/shared/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'

const EMPTY_FILTERS: MovieFilters = { genreIds: [], year: undefined, minRating: undefined }

export function WatchlistPage() {
  usePageTitle('Minha Lista')
  const { movies, remove } = useWatchlistStore()
  const [filters, setFilters] = useState<MovieFilters>(EMPTY_FILTERS)
  const [titleSearch, setTitleSearch] = useState('')

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      if (titleSearch && !m.title.toLowerCase().includes(titleSearch.toLowerCase())) return false
      if (filters.genreIds.length > 0 && !filters.genreIds.some((id) => m.genre_ids.includes(Number(id)))) return false
      if (filters.year && m.release_date.slice(0, 4) !== String(filters.year)) return false
      if (filters.minRating && m.vote_average < filters.minRating) return false
      return true
    })
  }, [movies, titleSearch, filters])

  const activeFiltersCount =
    filters.genreIds.length +
    (filters.year ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (titleSearch ? 1 : 0)

  const sidebarContent = (
    <div className="space-y-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
        Filtros
      </p>
      <Input
        placeholder="Buscar por título..."
        value={titleSearch}
        onChange={(e) => setTitleSearch(e.target.value)}
      />
      <FilterBar filters={filters} onChange={setFilters} sidebar />
    </div>
  )

  return (
    <div className="flex">
      {/* Sidebar — visível apenas em lg+ */}
      <aside className="hidden lg:block w-52 shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
        {sidebarContent}
      </aside>

      <main className="flex-1 min-w-0 p-4 lg:p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-semibold">Minha Lista</h1>
          <span className="font-mono text-xs text-muted-foreground">
            {filtered.length} de {movies.length} filmes
          </span>

          {/* Botão filtros — mobile only */}
          <Sheet>
            <SheetTrigger className="lg:hidden ml-auto inline-flex items-center gap-2 rounded-lg border border-border px-3 h-8 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto p-6">
              <SheetHeader className="mb-4">
                <SheetTitle className="font-mono text-sm uppercase tracking-widest text-primary">
                  Minha Lista
                </SheetTitle>
              </SheetHeader>
              {sidebarContent}
            </SheetContent>
          </Sheet>
        </div>

        <WatchlistTable movies={filtered} onRemove={remove} />
      </main>
    </div>
  )
}
