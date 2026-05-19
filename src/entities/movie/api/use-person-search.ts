import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

export function usePersonSearch(query: string) {
  return useQuery({
    queryKey: ['people', 'search', query],
    queryFn: () => tmdbApi.searchPerson(query),
    enabled: query.trim().length > 1,
    staleTime: 2 * 60 * 1000,
  })
}
