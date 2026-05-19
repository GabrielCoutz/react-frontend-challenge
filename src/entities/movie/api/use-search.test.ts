import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { createTestQueryClient } from '@/test/test-utils'
import { QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useSearch } from './use-search'

vi.mock('@/shared/api/tmdb-api', () => ({
  tmdbApi: {
    searchMovies: vi.fn().mockResolvedValue({ results: [], page: 1, total_pages: 1, total_results: 0 }),
  },
}))

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(QueryClientProvider, { client: createTestQueryClient() }, children)
}

describe('useSearch', () => {
  it('não dispara a query quando query está vazia', () => {
    const { result } = renderHook(() => useSearch(''), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('não dispara a query quando query é só espaços', () => {
    const { result } = renderHook(() => useSearch('   '), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('dispara a query quando há texto', async () => {
    const { result } = renderHook(() => useSearch('batman'), { wrapper })

    await waitFor(() => {
      expect(result.current.fetchStatus).not.toBe('idle')
    })
  })

  it('retorna isLoading true enquanto busca', async () => {
    const { result } = renderHook(() => useSearch('batman'), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })
})
