import { beforeEach, describe, expect, it } from 'vitest'
import { useWatchlistStore } from './watchlist-store'
import type { Movie } from '@/shared/api/tmdb.types'

const makeMovie = (overrides?: Partial<Movie>): Movie => ({
  id: 1,
  title: 'Duna',
  overview: 'Uma jornada épica.',
  poster_path: null,
  backdrop_path: null,
  release_date: '2021-10-22',
  vote_average: 7.9,
  vote_count: 5000,
  genre_ids: [878, 12],
  popularity: 500,
  ...overrides,
})

describe('watchlist-store', () => {
  beforeEach(() => {
    useWatchlistStore.setState({ movies: [] })
  })

  describe('add()', () => {
    it('adiciona um filme à lista', () => {
      const movie = makeMovie()
      useWatchlistStore.getState().add(movie)
      expect(useWatchlistStore.getState().movies).toHaveLength(1)
      expect(useWatchlistStore.getState().movies[0]?.id).toBe(1)
    })

    it('não adiciona o mesmo filme duas vezes', () => {
      const movie = makeMovie()
      useWatchlistStore.getState().add(movie)
      useWatchlistStore.getState().add(movie)
      expect(useWatchlistStore.getState().movies).toHaveLength(1)
    })

    it('adiciona múltiplos filmes diferentes', () => {
      useWatchlistStore.getState().add(makeMovie({ id: 1 }))
      useWatchlistStore.getState().add(makeMovie({ id: 2, title: 'Oppenheimer' }))
      expect(useWatchlistStore.getState().movies).toHaveLength(2)
    })
  })

  describe('remove()', () => {
    it('remove um filme pelo id', () => {
      const movie = makeMovie()
      useWatchlistStore.getState().add(movie)
      useWatchlistStore.getState().remove(movie.id)
      expect(useWatchlistStore.getState().movies).toHaveLength(0)
    })

    it('não afeta outros filmes ao remover', () => {
      useWatchlistStore.getState().add(makeMovie({ id: 1 }))
      useWatchlistStore.getState().add(makeMovie({ id: 2, title: 'Oppenheimer' }))
      useWatchlistStore.getState().remove(1)
      expect(useWatchlistStore.getState().movies).toHaveLength(1)
      expect(useWatchlistStore.getState().movies[0]?.id).toBe(2)
    })

    it('não lança erro ao remover id inexistente', () => {
      expect(() => useWatchlistStore.getState().remove(999)).not.toThrow()
    })
  })

  describe('isInWatchlist()', () => {
    it('retorna true para filme adicionado', () => {
      const movie = makeMovie()
      useWatchlistStore.getState().add(movie)
      expect(useWatchlistStore.getState().isInWatchlist(movie.id)).toBe(true)
    })

    it('retorna false para filme não adicionado', () => {
      expect(useWatchlistStore.getState().isInWatchlist(999)).toBe(false)
    })

    it('retorna false após remover o filme', () => {
      const movie = makeMovie()
      useWatchlistStore.getState().add(movie)
      useWatchlistStore.getState().remove(movie.id)
      expect(useWatchlistStore.getState().isInWatchlist(movie.id)).toBe(false)
    })
  })
})
