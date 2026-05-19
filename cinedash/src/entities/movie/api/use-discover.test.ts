import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createTestQueryClient } from '@/test/test-utils'
import { useDiscover } from './use-discover'

const mockDiscoverMovies = vi.hoisted(() => vi.fn())

vi.mock('@/shared/api/tmdb-api', () => ({
  tmdbApi: { discoverMovies: mockDiscoverMovies },
}))

function makeWrapper() {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: createTestQueryClient() }, children)
}

const EMPTY_RESPONSE = { results: [], page: 1, total_pages: 1, total_results: 0 }

describe('useDiscover', () => {
  beforeEach(() => {
    mockDiscoverMovies.mockResolvedValue(EMPTY_RESPONSE)
  })

  describe('enabled logic', () => {
    it('não dispara a query quando nenhum filtro está ativo', () => {
      const { result } = renderHook(() => useDiscover({}), { wrapper: makeWrapper() })
      expect(result.current.fetchStatus).toBe('idle')
    })

    it('dispara a query quando genreIds tem valores', async () => {
      const { result } = renderHook(() => useDiscover({ genreIds: ['28'] }), { wrapper: makeWrapper() })
      await waitFor(() => expect(result.current.fetchStatus).not.toBe('idle'))
    })

    it('dispara a query quando year está definido', async () => {
      const { result } = renderHook(() => useDiscover({ year: 2023 }), { wrapper: makeWrapper() })
      await waitFor(() => expect(result.current.fetchStatus).not.toBe('idle'))
    })

    it('dispara a query quando minRating está definido', async () => {
      const { result } = renderHook(() => useDiscover({ minRating: 7 }), { wrapper: makeWrapper() })
      await waitFor(() => expect(result.current.fetchStatus).not.toBe('idle'))
    })

    it('dispara a query quando personId está definido', async () => {
      const { result } = renderHook(() => useDiscover({ personId: 500 }), { wrapper: makeWrapper() })
      await waitFor(() => expect(result.current.fetchStatus).not.toBe('idle'))
    })

    it('dispara a query quando certification está definida', async () => {
      const { result } = renderHook(() => useDiscover({ certification: '14' }), { wrapper: makeWrapper() })
      await waitFor(() => expect(result.current.fetchStatus).not.toBe('idle'))
    })

    it('não dispara a query para genreIds array vazio', () => {
      const { result } = renderHook(() => useDiscover({ genreIds: [] }), { wrapper: makeWrapper() })
      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('transformação de parâmetros', () => {
    it('une genreIds com vírgula', async () => {
      const { result } = renderHook(() => useDiscover({ genreIds: ['28', '12', '878'] }), { wrapper: makeWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockDiscoverMovies).toHaveBeenCalledWith(
        expect.objectContaining({ with_genres: '28,12,878' }),
      )
    })

    it('envia certification_country BR quando certification está presente', async () => {
      const { result } = renderHook(() => useDiscover({ certification: '14' }), { wrapper: makeWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockDiscoverMovies).toHaveBeenCalledWith(
        expect.objectContaining({ certification: '14', certification_country: 'BR' }),
      )
    })

    it('não envia certification_country quando certification é undefined', async () => {
      const { result } = renderHook(() => useDiscover({ minRating: 7 }), { wrapper: makeWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockDiscoverMovies).toHaveBeenCalledWith(
        expect.objectContaining({ certification_country: undefined }),
      )
    })

    it('envia page correta', async () => {
      const { result } = renderHook(() => useDiscover({ minRating: 6, page: 3 }), { wrapper: makeWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockDiscoverMovies).toHaveBeenCalledWith(
        expect.objectContaining({ page: 3 }),
      )
    })

    it('mapeia minRating para vote_average.gte', async () => {
      const { result } = renderHook(() => useDiscover({ minRating: 8 }), { wrapper: makeWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockDiscoverMovies).toHaveBeenCalledWith(
        expect.objectContaining({ 'vote_average.gte': 8 }),
      )
    })

    it('mapeia personId para with_cast', async () => {
      const { result } = renderHook(() => useDiscover({ personId: 500 }), { wrapper: makeWrapper() })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockDiscoverMovies).toHaveBeenCalledWith(
        expect.objectContaining({ with_cast: 500 }),
      )
    })
  })
})
