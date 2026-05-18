import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

interface DiscoverParams {
  page?: number
  genreIds?: string[]
  year?: number
  minRating?: number
  personId?: number
}

export function useDiscover({ page = 1, genreIds, year, minRating, personId }: DiscoverParams) {
  const withGenres = genreIds && genreIds.length > 0 ? genreIds.join(',') : undefined

  return useQuery({
    queryKey: ['movies', 'discover', { page, genreIds, year, minRating, personId }],
    queryFn: () =>
      tmdbApi.discoverMovies({
        page,
        with_genres: withGenres,
        primary_release_year: year,
        'vote_average.gte': minRating,
        with_cast: personId,
      }),
    enabled: !!(withGenres || year || minRating || personId),
  })
}
