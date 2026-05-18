import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WatchlistMovie {
  id: number
  title: string
  genre_ids: number[]
  release_date: string
  vote_average: number
}

interface WatchlistState {
  movies: WatchlistMovie[]
  add: (movie: WatchlistMovie) => void
  remove: (movieId: number) => void
  isInWatchlist: (movieId: number) => boolean
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      movies: [],

      add: (movie: WatchlistMovie) => {
        if (get().isInWatchlist(movie.id)) return
        set((state) => ({ movies: [...state.movies, movie] }))
      },

      remove: (movieId: number) => {
        set((state) => ({ movies: state.movies.filter((m) => m.id !== movieId) }))
      },

      isInWatchlist: (movieId: number) => {
        return get().movies.some((m) => m.id === movieId)
      },
    }),
    {
      name: 'watchlist-storage',
      partialize: (state) => ({ movies: state.movies }),
    },
  ),
)
