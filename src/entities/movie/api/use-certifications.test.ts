import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect } from 'vitest'
import { createTestQueryClient } from '@/test/test-utils'
import { useCertifications } from './use-certifications'

const mockGetCertifications = vi.hoisted(() => vi.fn())

vi.mock('@/shared/api/tmdb-api', () => ({
  tmdbApi: { getCertifications: mockGetCertifications },
}))

const BR_CERTS = [
  { certification: '14', meaning: 'Não recomendado para menores de 14', order: 3 },
  { certification: 'L', meaning: 'Livre para todos os públicos', order: 1 },
  { certification: '18', meaning: 'Não recomendado para menores de 18', order: 5 },
  { certification: '12', meaning: 'Não recomendado para menores de 12', order: 2 },
  { certification: '16', meaning: 'Não recomendado para menores de 16', order: 4 },
]

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(QueryClientProvider, { client: createTestQueryClient() }, children)
}

describe('useCertifications', () => {
  it('retorna apenas certificações brasileiras (BR)', async () => {
    mockGetCertifications.mockResolvedValue({ BR: BR_CERTS, US: [{ certification: 'G', meaning: '', order: 1 }] })
    const { result } = renderHook(() => useCertifications(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(5)
    expect(result.current.data!.some((c) => c.certification === 'G')).toBe(false)
  })

  it('ordena certificações pelo campo order (crescente)', async () => {
    mockGetCertifications.mockResolvedValue({ BR: BR_CERTS })
    const { result } = renderHook(() => useCertifications(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const orders = result.current.data!.map((c) => c.order)
    expect(orders).toEqual([1, 2, 3, 4, 5])
  })

  it('primeira certificação após ordenação é L (order=1)', async () => {
    mockGetCertifications.mockResolvedValue({ BR: BR_CERTS })
    const { result } = renderHook(() => useCertifications(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data![0]?.certification).toBe('L')
  })

  it('última certificação após ordenação é 18 (order=5)', async () => {
    mockGetCertifications.mockResolvedValue({ BR: BR_CERTS })
    const { result } = renderHook(() => useCertifications(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.at(-1)?.certification).toBe('18')
  })

  it('não dispara a query quando enabled=false', () => {
    const { result } = renderHook(() => useCertifications(false), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('retorna array vazio quando BR não está na resposta', async () => {
    mockGetCertifications.mockResolvedValue({ US: [{ certification: 'G', meaning: '', order: 1 }] })
    const { result } = renderHook(
      () => useCertifications(),
      { wrapper: ({ children }) => createElement(QueryClientProvider, { client: createTestQueryClient() }, children) },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(0)
  })
})
