import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

interface DiscoverParams {
  page?: number
  genreId?: string
  year?: number
  minRating?: number
}

export function useDiscover({ page = 1, genreId, year, minRating }: DiscoverParams) {
  return useQuery({
    queryKey: ['movies', 'discover', { page, genreId, year, minRating }],
    queryFn: () =>
      tmdbApi.discoverMovies({
        page,
        with_genres: genreId,
        primary_release_year: year,
        'vote_average.gte': minRating,
      }),
    enabled: !!(genreId || year || minRating),
  })
}
