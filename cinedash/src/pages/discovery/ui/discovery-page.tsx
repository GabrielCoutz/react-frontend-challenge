import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/features/movie-search/ui/search-input'
import { FilterBar, type MovieFilters } from '@/features/movie-filters/ui/filter-bar'
import { MovieGrid } from '@/widgets/movie-grid/ui/movie-grid'
import { useTrending } from '@/entities/movie/api/use-trending'
import { useSearch } from '@/entities/movie/api/use-search'
import { useDiscover } from '@/entities/movie/api/use-discover'
import { useGenres } from '@/entities/movie/api/use-genres'

const DEFAULT_FILTERS: MovieFilters = { genreId: '', year: undefined, minRating: undefined }

function hasFilters(f: MovieFilters) {
  return !!(f.genreId || f.year || f.minRating)
}

export function DiscoveryPage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<MovieFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  const { data: genres = [] } = useGenres()

  const isSearching = query.trim().length > 0
  const isFiltering = hasFilters(filters)

  const trending = useTrending(page)
  const search = useSearch(query, page)
  const discover = useDiscover({ page, genreId: filters.genreId, year: filters.year, minRating: filters.minRating })

  const active = isSearching ? search : isFiltering ? discover : trending

  const movies = active.data?.results ?? []
  const totalPages = active.data?.total_pages ?? 1

  const handleSearch = useCallback((q: string) => {
    setQuery(q)
    setPage(1)
  }, [])

  const handleFilters = useCallback((f: MovieFilters) => {
    setFilters(f)
    setPage(1)
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Descobrir Filmes</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput onSearch={handleSearch} />
        <FilterBar filters={filters} onChange={handleFilters} />
      </div>

      <MovieGrid
        movies={movies}
        genres={genres}
        isLoading={active.isLoading}
        isError={active.isError}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {Math.min(totalPages, 500)}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
