import { useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useSearch as useMovieSearch, useTrending, useDiscover } from '@/entities/movie'
import type { MovieFilters } from '@/features/movie-filters'

function hasFilters(f: MovieFilters) {
  return !!(f.genreIds.length || f.year || f.minRating || f.certification)
}

export function useDiscoveryFilters() {
  const navigate = useNavigate({ from: '/discovery' })

  const {
    query = '',
    genreIds = [],
    year,
    minRating,
    certification,
    personId,
    personName,
    page = 1,
  } = useSearch({ from: '/_authenticated/discovery' })

  const filters: MovieFilters = { genreIds, year, minRating, certification }
  const isSearching = query.trim().length > 0
  const isFiltering = hasFilters(filters) || !!personId

  const trending = useTrending(page)
  const searchResults = useMovieSearch(query, page)
  const discover = useDiscover({ page, genreIds, year, minRating, certification, personId })

  // Filtros têm prioridade: /discover/movie não suporta query de texto,
  // por isso quando filtros estão ativos o texto é ignorado na API
  const active = isFiltering ? discover : isSearching ? searchResults : trending
  const movies = active.data?.results ?? []
  const totalPages = active.data?.total_pages ?? 1

  const sectionTitle = personId
    ? `Filmes com ${personName ?? '...'}`
    : isFiltering
      ? 'Filmes filtrados'
      : isSearching
        ? `Resultados para "${query}"`
        : 'Trending Esta Semana'

  const activeFiltersCount =
    genreIds.length +
    (year ? 1 : 0) +
    (minRating ? 1 : 0) +
    (certification ? 1 : 0) +
    (personId ? 1 : 0) +
    (query ? 1 : 0)

  const handleSearch = useCallback((q: string) => {
    navigate({ search: (prev) => ({ ...prev, query: q || undefined, page: 1 }) })
  }, [navigate])

  const handleFilters = useCallback((f: MovieFilters) => {
    navigate({
      search: (prev) => ({
        ...prev,
        genreIds: f.genreIds.length ? f.genreIds : undefined,
        year: f.year,
        minRating: f.minRating,
        certification: f.certification,
        page: 1,
      }),
    })
  }, [navigate])

  const handlePersonChange = useCallback((id: number | undefined, name: string | undefined) => {
    navigate({ search: (prev) => ({ ...prev, personId: id, personName: name, page: 1 }) })
  }, [navigate])

  const handlePage = useCallback((next: number) => {
    navigate({ search: (prev) => ({ ...prev, page: next }) })
  }, [navigate])

  const handleRetry = useCallback(() => { void active.refetch() }, [active])

  return {
    query,
    filters,
    personId,
    personName,
    page,
    movies,
    totalPages,
    sectionTitle,
    activeFiltersCount,
    isLoading: active.isLoading,
    isError: active.isError,
    handleSearch,
    handleFilters,
    handlePersonChange,
    handlePage,
    handleRetry,
  }
}
