import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

export function useTrending(page = 1) {
  return useQuery({
    queryKey: ['movies', 'trending', page],
    queryFn: () => tmdbApi.getTrending(page),
    staleTime: 5 * 60 * 1000,
  })
}
