import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: () => tmdbApi.getGenres(),
    staleTime: Infinity,
  })
}
