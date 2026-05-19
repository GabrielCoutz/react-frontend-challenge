import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'
import type { MovieWithReleaseDates } from '@/shared/api/tmdb.types'

export function useMovie(id: number) {
  return useQuery<MovieWithReleaseDates>({
    queryKey: ['movies', 'detail', id],
    queryFn: () => tmdbApi.getMovie(id),
    enabled: !!id,
  })
}
