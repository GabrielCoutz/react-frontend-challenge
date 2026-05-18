import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

interface DiscoverParams {
  page?: number
  genreIds?: string[]
  year?: number
  minRating?: number
}

export function useDiscover({ page = 1, genreIds, year, minRating }: DiscoverParams) {
  const withGenres = genreIds && genreIds.length > 0 ? genreIds.join(',') : undefined

  return useQuery({
    queryKey: ['movies', 'discover', { page, genreIds, year, minRating }],
    queryFn: () =>
      tmdbApi.discoverMovies({
        page,
        with_genres: withGenres,
        primary_release_year: year,
        'vote_average.gte': minRating,
      }),
    enabled: !!(withGenres || year || minRating),
  })
}
