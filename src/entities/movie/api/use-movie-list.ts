import { useQuery } from '@tanstack/react-query'
import { tmdbApi } from '@/shared/api/tmdb-api'
import type { PaginatedResponse, Movie } from '@/shared/api/tmdb.types'

export type MovieListCategory = 'trending' | 'popular' | 'top_rated' | 'now_playing' | 'upcoming'

export const CATEGORY_SORT_BY: Record<MovieListCategory, string> = {
  trending: 'popularity.desc',
  popular: 'popularity.desc',
  top_rated: 'vote_average.desc',
  now_playing: 'primary_release_date.desc',
  upcoming: 'primary_release_date.asc',
}

export const CATEGORY_LABELS: Record<MovieListCategory, string> = {
  trending: 'Trending',
  popular: 'Populares',
  top_rated: 'Mais Avaliados',
  now_playing: 'Em Cartaz',
  upcoming: 'Em Breve',
}

const fetchers: Record<MovieListCategory, (page: number) => Promise<PaginatedResponse<Movie>>> = {
  trending: tmdbApi.getTrending,
  popular: tmdbApi.getPopular,
  top_rated: tmdbApi.getTopRated,
  now_playing: tmdbApi.getNowPlaying,
  upcoming: tmdbApi.getUpcoming,
}

export function useMovieList(category: MovieListCategory, page = 1) {
  return useQuery({
    queryKey: ['movies', 'list', category, page],
    queryFn: () => fetchers[category](page),
    staleTime: 5 * 60 * 1000,
  })
}
