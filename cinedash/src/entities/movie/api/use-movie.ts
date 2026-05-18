import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

export function useMovie(id: number) {
  return useQuery({
    queryKey: ['movies', 'detail', id],
    queryFn: () => tmdbApi.getMovie(id),
    enabled: !!id,
  })
}
