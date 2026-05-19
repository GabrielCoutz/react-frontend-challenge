import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

interface DiscoverParams {
  page?: number
  genreIds?: string[]
  year?: number
  minRating?: number
  personId?: number
  sortBy?: string
  certification?: string
}

export function useDiscover({ page = 1, genreIds, year, minRating, personId, sortBy, certification }: DiscoverParams) {
  const withGenres = genreIds && genreIds.length > 0 ? genreIds.join(',') : undefined

  return useQuery({
    queryKey: ['movies', 'discover', { page, genreIds, year, minRating, personId, sortBy, certification }],
    queryFn: () =>
      tmdbApi.discoverMovies({
        page,
        with_genres: withGenres,
        primary_release_year: year,
        'vote_average.gte': minRating,
        with_cast: personId,
        sort_by: sortBy,
        certification: certification,
        certification_country: certification ? 'BR' : undefined,
      }),
    enabled: !!(withGenres || year || minRating || personId || certification),
  })
}
