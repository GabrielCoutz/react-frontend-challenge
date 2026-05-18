import { useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/features/movie-search/ui/search-input'
import { FilterBar, type MovieFilters } from '@/features/movie-filters/ui/filter-bar'
import { MovieGrid } from '@/widgets/movie-grid/ui/movie-grid'
import { useTrending } from '@/entities/movie/api/use-trending'
import { useSearch as useMovieSearch } from '@/entities/movie/api/use-search'
import { useDiscover } from '@/entities/movie/api/use-discover'
import { useGenres } from '@/entities/movie/api/use-genres'

function hasFilters(f: MovieFilters) {
  return !!(f.genreId || f.year || f.minRating)
}

export function DiscoveryPage() {
  const navigate = useNavigate({ from: '/discovery' })
  const { query = '', genreId = '', year, minRating, page = 1 } = useSearch({
    from: '/_authenticated/discovery',
  })

  const { data: genres = [] } = useGenres()
  const filters: MovieFilters = { genreId, year, minRating }
  const isSearching = query.trim().length > 0
  const isFiltering = hasFilters(filters)

  const trending = useTrending(page)
  const searchResults = useMovieSearch(query, page)
  const discover = useDiscover({ page, genreId, year, minRating })

  const active = isSearching ? searchResults : isFiltering ? discover : trending
  const movies = active.data?.results ?? []
  const totalPages = active.data?.total_pages ?? 1

  const handleSearch = useCallback((q: string) => {
    navigate({ search: (prev) => ({ ...prev, query: q || undefined, page: 1 }) })
  }, [navigate])

  const handleFilters = useCallback((f: MovieFilters) => {
    navigate({
      search: (prev) => ({
        ...prev,
        genreId: f.genreId || undefined,
        year: f.year,
        minRating: f.minRating,
        page: 1,
      }),
    })
  }, [navigate])

  const handlePage = (next: number) => {
    navigate({ search: (prev) => ({ ...prev, page: next }) })
  }

  const sectionTitle = isSearching
    ? `Resultados para "${query}"`
    : isFiltering
      ? 'Filmes filtrados'
      : 'Trending Esta Semana'

  return (
    <div className="flex">
      {/* Sidebar de filtros */}
      <aside className="w-52 shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4 space-y-6">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
            Filtros
          </p>
          <FilterBar filters={filters} onChange={handleFilters} sidebar />
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 min-w-0 p-6 space-y-5">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{sectionTitle}</h1>
          <div className="flex-1 max-w-sm">
            <SearchInput onSearch={handleSearch} initialValue={query} />
          </div>
        </div>

        <MovieGrid
          movies={movies}
          genres={genres}
          isLoading={active.isLoading}
          isError={active.isError}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button variant="outline" size="icon" onClick={() => handlePage(Math.max(1, page - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-mono text-xs text-muted-foreground">
              {page} / {Math.min(totalPages, 500)}
            </span>
            <Button variant="outline" size="icon" onClick={() => handlePage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
