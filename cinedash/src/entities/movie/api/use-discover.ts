import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'

export const VALID_SORT_BY = [
  'popularity.asc', 'popularity.desc',
  'vote_average.asc', 'vote_average.desc',
  'primary_release_date.asc', 'primary_release_date.desc',
  'revenue.asc', 'revenue.desc',
  'original_title.asc', 'original_title.desc',
] as const

export type SortBy = typeof VALID_SORT_BY[number]

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
  const safeSortBy = VALID_SORT_BY.find((v) => v === sortBy)

  return useQuery({
    queryKey: ['movies', 'discover', { page, genreIds, year, minRating, personId, sortBy: safeSortBy, certification }],
    queryFn: () =>
      tmdbApi.discoverMovies({
        page,
        with_genres: withGenres,
        primary_release_year: year,
        'vote_average.gte': minRating,
        with_cast: personId,
        sort_by: safeSortBy,
        certification: certification,
        certification_country: certification ? 'BR' : undefined,
      }),
    enabled: !!(withGenres || year || minRating || personId || certification),
  })
}
