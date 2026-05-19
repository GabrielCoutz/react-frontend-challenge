import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

export function useVideos(id: number) {
  return useQuery({
    queryKey: ['movies', 'videos', id],
    queryFn: () => tmdbApi.getVideos(id),
    enabled: !!id,
    select: (data) =>
      data.results.filter((v) => v.site === 'YouTube' && v.type === 'Trailer'),
  })
}
