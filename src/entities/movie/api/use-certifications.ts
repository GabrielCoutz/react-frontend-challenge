import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

const COUNTRY = 'BR'

export function useCertifications(enabled = true) {
  return useQuery({
    queryKey: ['certifications', COUNTRY],
    queryFn: async () => {
      const all = await tmdbApi.getCertifications()
      return (all[COUNTRY] ?? []).sort((a, b) => a.order - b.order)
    },
    staleTime: Infinity,
    enabled,
  })
}
