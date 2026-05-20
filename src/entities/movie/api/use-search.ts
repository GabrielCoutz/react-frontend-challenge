import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

export function useSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ['movies', 'search', query, page],
    queryFn: () => tmdbApi.searchMovies(query, page),
    enabled: query.trim().length > 0,
  })
}
