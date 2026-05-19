import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

export function useCredits(id: number) {
  return useQuery({
    queryKey: ['movies', 'credits', id],
    queryFn: () => tmdbApi.getCredits(id),
    enabled: !!id,
  })
}
