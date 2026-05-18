import { useMemo, useState } from 'react'
import { useWatchlistStore } from '@/features/watchlist/model/watchlist-store'
import { WatchlistTable } from '@/widgets/movie-table/ui/watchlist-table'
import { FilterBar, type MovieFilters } from '@/features/movie-filters/ui/filter-bar'
import { Input } from '@/components/ui/input'

const EMPTY_FILTERS: MovieFilters = { genreIds: [], year: undefined, minRating: undefined }

export function WatchlistPage() {
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

  return (
    <div className="flex">
      <aside className="w-52 shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4 space-y-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
          Filtros
        </p>
        <Input
          placeholder="Buscar por título..."
          value={titleSearch}
          onChange={(e) => setTitleSearch(e.target.value)}
        />
        <FilterBar filters={filters} onChange={setFilters} sidebar />
      </aside>

      <main className="flex-1 min-w-0 p-6 space-y-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold">Minha Lista</h1>
          <span className="font-mono text-xs text-muted-foreground">
            {filtered.length} de {movies.length} filmes
          </span>
        </div>
        <WatchlistTable movies={filtered} onRemove={remove} />
      </main>
    </div>
  )
}
