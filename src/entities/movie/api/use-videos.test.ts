import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createTestQueryClient } from '@/test/test-utils'
import { useVideos } from './use-videos'

const mockGetVideos = vi.hoisted(() => vi.fn())

vi.mock('@/shared/api/tmdb-api', () => ({
  tmdbApi: { getVideos: mockGetVideos },
}))

const ALL_VIDEOS = [
  { id: '1', key: 'abc', site: 'YouTube', type: 'Trailer', name: 'Trailer Oficial' },
  { id: '2', key: 'def', site: 'YouTube', type: 'Teaser', name: 'Teaser' },
  { id: '3', key: 'ghi', site: 'Vimeo', type: 'Trailer', name: 'Trailer Vimeo' },
  { id: '4', key: 'jkl', site: 'YouTube', type: 'Trailer', name: 'Trailer 2' },
]

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(QueryClientProvider, { client: createTestQueryClient() }, children)
}

describe('useVideos', () => {
  beforeEach(() => {
    mockGetVideos.mockResolvedValue({ results: ALL_VIDEOS })
  })

  it('não dispara a query quando id é 0', () => {
    const { result } = renderHook(() => useVideos(0), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('retorna apenas trailers do YouTube', async () => {
    const { result } = renderHook(() => useVideos(1), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    result.current.data!.forEach((v) => {
      expect(v.site).toBe('YouTube')
      expect(v.type).toBe('Trailer')
    })
  })

  it('exclui teasers mesmo que sejam do YouTube', async () => {
    const { result } = renderHook(() => useVideos(1), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.some((v) => v.type === 'Teaser')).toBe(false)
  })

  it('exclui trailers de sites que não são YouTube', async () => {
    const { result } = renderHook(() => useVideos(1), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.some((v) => v.site === 'Vimeo')).toBe(false)
  })

  it('retorna array vazio quando não há trailers YouTube', async () => {
    mockGetVideos.mockResolvedValueOnce({ results: [
      { id: '1', key: 'x', site: 'Vimeo', type: 'Trailer', name: 'T' },
    ]})
    const { result } = renderHook(
      () => useVideos(99),
      { wrapper: ({ children }) => createElement(QueryClientProvider, { client: createTestQueryClient() }, children) },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(0)
  })
})
