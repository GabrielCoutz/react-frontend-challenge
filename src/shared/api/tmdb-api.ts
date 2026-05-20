import type {
  Genre,
  Movie,
  MovieWithReleaseDates,
  Person,
  Certification,
  PaginatedResponse,
  CreditsResponse,
  VideosResponse,
} from "./tmdb.types";
import { tmdbClient } from "./tmdb-client";

export const tmdbApi = {
  getTrending: async (page = 1): Promise<PaginatedResponse<Movie>> => {
    const { data } = await tmdbClient.get<PaginatedResponse<Movie>>(
      "/trending/movie/week",
      { params: { page } },
    );
    return data;
  },

  getPopular: async (page = 1): Promise<PaginatedResponse<Movie>> => {
    const { data } = await tmdbClient.get<PaginatedResponse<Movie>>(
      "/movie/popular",
      { params: { page } },
    );
    return data;
  },

  getTopRated: async (page = 1): Promise<PaginatedResponse<Movie>> => {
    const { data } = await tmdbClient.get<PaginatedResponse<Movie>>(
      "/movie/top_rated",
      { params: { page } },
    );
    return data;
  },

  getNowPlaying: async (page = 1): Promise<PaginatedResponse<Movie>> => {
    const { data } = await tmdbClient.get<PaginatedResponse<Movie>>(
      "/movie/now_playing",
      { params: { page } },
    );
    return data;
  },

  getUpcoming: async (page = 1): Promise<PaginatedResponse<Movie>> => {
    const { data } = await tmdbClient.get<PaginatedResponse<Movie>>(
      "/movie/upcoming",
      { params: { page } },
    );
    return data;
  },

  searchMovies: async (
    query: string,
    page = 1,
  ): Promise<PaginatedResponse<Movie>> => {
    const { data } = await tmdbClient.get<PaginatedResponse<Movie>>(
      "/search/movie",
      { params: { query, page } },
    );
    return data;
  },

  getMovie: async (id: number): Promise<MovieWithReleaseDates> => {
    const { data } = await tmdbClient.get<MovieWithReleaseDates>(`/movie/${id}`, {
      params: { append_to_response: 'release_dates' },
    });
    return data;
  },

  getCertifications: async (): Promise<Record<string, Certification[]>> => {
    const { data } = await tmdbClient.get<{ certifications: Record<string, Certification[]> }>(
      '/certification/movie/list',
    );
    return data.certifications;
  },

  getCredits: async (id: number): Promise<CreditsResponse> => {
    const { data } = await tmdbClient.get<CreditsResponse>(
      `/movie/${id}/credits`,
    );
    return data;
  },

  getVideos: async (id: number): Promise<VideosResponse> => {
    const { data } = await tmdbClient.get<VideosResponse>(
      `/movie/${id}/videos`,
    );
    return data;
  },

  getGenres: async (): Promise<Genre[]> => {
    const { data } = await tmdbClient.get<{ genres: Genre[] }>(
      "/genre/movie/list",
    );
    return data.genres;
  },

  discoverMovies: async (params: {
    page?: number;
    with_genres?: string;
    primary_release_year?: number;
    "vote_average.gte"?: number;
    with_cast?: number;
    sort_by?: 'popularity.asc' | 'popularity.desc' | 'vote_average.asc' | 'vote_average.desc' | 'primary_release_date.asc' | 'primary_release_date.desc' | 'revenue.asc' | 'revenue.desc' | 'original_title.asc' | 'original_title.desc';
    certification?: string;
    certification_country?: string;
  }): Promise<PaginatedResponse<Movie>> => {
    const { data } = await tmdbClient.get<PaginatedResponse<Movie>>(
      "/discover/movie",
      { params },
    );
    return data;
  },

  searchPerson: async (query: string): Promise<PaginatedResponse<Person>> => {
    const { data } = await tmdbClient.get<PaginatedResponse<Person>>(
      "/search/person",
      { params: { query } },
    );
    return data;
  },
};
