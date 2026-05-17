import type { Genre, Movie, PaginatedResponse, CreditsResponse, VideosResponse } from './tmdb.types'
import { tmdbClient } from './tmdb-client'
import {
  MOCK_MOVIES,
  MOCK_GENRES,
  MOCK_CREDITS,
  MOCK_VIDEOS,
  mockPaginated,
} from './mock/mock-data'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

function delay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const tmdbApi = {
  getTrending: async (page = 1): Promise<PaginatedResponse<Movie>> => {
    if (useMock) {
      await delay()
      return mockPaginated(MOCK_MOVIES, page)
    }
    const { data } = await tmdbClient.get<PaginatedResponse<Movie>>('/trending/movie/week', { params: { page } })
    return data
  },

  searchMovies: async (query: string, page = 1): Promise<PaginatedResponse<Movie>> => {
    if (useMock) {
      await delay(400)
      const filtered = MOCK_MOVIES.filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase()),
      )
      return mockPaginated(filtered, page)
    }
    const { data } = await tmdbClient.get<PaginatedResponse<Movie>>('/search/movie', { params: { query, page } })
    return data
  },

  getMovie: async (id: number): Promise<Movie> => {
    if (useMock) {
      await delay()
      const movie = MOCK_MOVIES.find((m) => m.id === id)
      if (!movie) throw new Error('Movie not found')
      return movie
    }
    const { data } = await tmdbClient.get<Movie>(`/movie/${id}`)
    return data
  },

  getCredits: async (id: number): Promise<CreditsResponse> => {
    if (useMock) {
      await delay(300)
      return MOCK_CREDITS[id] ?? { id, cast: [] }
    }
    const { data } = await tmdbClient.get<CreditsResponse>(`/movie/${id}/credits`)
    return data
  },

  getVideos: async (id: number): Promise<VideosResponse> => {
    if (useMock) {
      await delay(300)
      return MOCK_VIDEOS[id] ?? { id, results: [] }
    }
    const { data } = await tmdbClient.get<VideosResponse>(`/movie/${id}/videos`)
    return data
  },

  getGenres: async (): Promise<Genre[]> => {
    if (useMock) {
      await delay(200)
      return MOCK_GENRES
    }
    const { data } = await tmdbClient.get<{ genres: Genre[] }>('/genre/movie/list')
    return data.genres
  },

  discoverMovies: async (params: {
    page?: number
    with_genres?: string
    primary_release_year?: number
    'vote_average.gte'?: number
  }): Promise<PaginatedResponse<Movie>> => {
    if (useMock) {
      await delay()
      let filtered = [...MOCK_MOVIES]
      if (params.with_genres) {
        const genreId = Number(params.with_genres)
        filtered = filtered.filter((m) => m.genre_ids.includes(genreId))
      }
      if (params.primary_release_year) {
        filtered = filtered.filter((m) =>
          m.release_date.startsWith(String(params.primary_release_year)),
        )
      }
      if (params['vote_average.gte']) {
        filtered = filtered.filter((m) => m.vote_average >= (params['vote_average.gte'] ?? 0))
      }
      return mockPaginated(filtered, params.page ?? 1)
    }
    const { data } = await tmdbClient.get<PaginatedResponse<Movie>>('/discover/movie', { params })
    return data
  },
}
