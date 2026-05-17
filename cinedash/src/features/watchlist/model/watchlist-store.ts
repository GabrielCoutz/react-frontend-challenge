import { create } from 'zustand'
import type { Movie } from '@/shared/api/tmdb.types'

// TODO: [Zustand] adicionar persist middleware para salvar watchlist em localStorage
// Exemplo: import { persist } from 'zustand/middleware'
// Envolver o create com: create(persist(..., { name: 'watchlist-storage' }))

interface WatchlistState {
  movies: Movie[]
  add: (movie: Movie) => void
  remove: (movieId: number) => void
  isInWatchlist: (movieId: number) => boolean
}

export const useWatchlistStore = create<WatchlistState>()((set, get) => ({
  movies: [],

  add: (movie: Movie) => {
    if (get().isInWatchlist(movie.id)) return
    set((state) => ({ movies: [...state.movies, movie] }))
  },

  remove: (movieId: number) => {
    set((state) => ({ movies: state.movies.filter((m) => m.id !== movieId) }))
  },

  isInWatchlist: (movieId: number) => {
    return get().movies.some((m) => m.id === movieId)
  },
}))
