import type {
  Genre,
  Movie,
  Person,
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

  getMovie: async (id: number): Promise<Movie> => {
    const { data } = await tmdbClient.get<Movie>(`/movie/${id}`);
    return data;
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
