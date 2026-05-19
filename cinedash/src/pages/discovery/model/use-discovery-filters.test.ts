import { renderHook } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useDiscoveryFilters } from './use-discovery-filters'

const mockNavigate = vi.fn()

const mockQueryResult = {
  data: { results: [], page: 1, total_pages: 5 },
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
}

// Estado da URL simulado — sobrescrito em cada describe/it
let mockSearchParams: Record<string, unknown> = {}

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearchParams,
}))

vi.mock('@/entities/movie', () => ({
  useSearch: () => mockQueryResult,
  useTrending: () => mockQueryResult,
  useDiscover: () => mockQueryResult,
}))

describe('useDiscoveryFilters', () => {
  beforeEach(() => {
    mockSearchParams = {}
    mockNavigate.mockClear()
  })

  describe('sectionTitle', () => {
    it('exibe "Trending Esta Semana" quando não há query, filtros nem person', () => {
      mockSearchParams = {}
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.sectionTitle).toBe('Trending Esta Semana')
    })

    it('exibe resultado de busca quando há query', () => {
      mockSearchParams = { query: 'batman' }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.sectionTitle).toBe('Resultados para "batman"')
    })

    it('exibe "Filmes filtrados" quando há filtros ativos', () => {
      mockSearchParams = { genreIds: ['28'] }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.sectionTitle).toBe('Filmes filtrados')
    })

    it('exibe "Filmes filtrados" quando há apenas ano definido', () => {
      mockSearchParams = { year: 2023 }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.sectionTitle).toBe('Filmes filtrados')
    })

    it('exibe nome da pessoa quando personId está definido', () => {
      mockSearchParams = { personId: 500, personName: 'Tom Hanks' }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.sectionTitle).toBe('Filmes com Tom Hanks')
    })

    it('usa "..." quando personId definido mas personName ausente', () => {
      mockSearchParams = { personId: 500 }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.sectionTitle).toBe('Filmes com ...')
    })

    it('personId tem prioridade sobre filtros e query', () => {
      mockSearchParams = { personId: 500, personName: 'Ator', query: 'batman', genreIds: ['28'] }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.sectionTitle).toBe('Filmes com Ator')
    })

    it('filtros têm prioridade sobre query de texto', () => {
      mockSearchParams = { query: 'batman', genreIds: ['28'] }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.sectionTitle).toBe('Filmes filtrados')
    })
  })

  describe('activeFiltersCount', () => {
    it('retorna 0 sem filtros ativos', () => {
      mockSearchParams = {}
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.activeFiltersCount).toBe(0)
    })

    it('conta cada gênero selecionado individualmente', () => {
      mockSearchParams = { genreIds: ['28', '12', '878'] }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.activeFiltersCount).toBe(3)
    })

    it('conta year como 1', () => {
      mockSearchParams = { year: 2023 }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.activeFiltersCount).toBe(1)
    })

    it('conta minRating como 1', () => {
      mockSearchParams = { minRating: 7 }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.activeFiltersCount).toBe(1)
    })

    it('conta certification como 1', () => {
      mockSearchParams = { certification: '14' }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.activeFiltersCount).toBe(1)
    })

    it('conta personId como 1', () => {
      mockSearchParams = { personId: 500 }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.activeFiltersCount).toBe(1)
    })

    it('conta query como 1', () => {
      mockSearchParams = { query: 'batman' }
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.activeFiltersCount).toBe(1)
    })

    it('soma todos os filtros ativos simultaneamente', () => {
      mockSearchParams = {
        query: 'batman',
        genreIds: ['28', '12'],
        year: 2023,
        minRating: 7,
        certification: '14',
        personId: 500,
      }
      const { result } = renderHook(() => useDiscoveryFilters())
      // 1 (query) + 2 (genres) + 1 (year) + 1 (minRating) + 1 (cert) + 1 (personId) = 7
      expect(result.current.activeFiltersCount).toBe(7)
    })
  })

  describe('valores padrão', () => {
    it('page padrão é 1', () => {
      mockSearchParams = {}
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.page).toBe(1)
    })

    it('query padrão é string vazia', () => {
      mockSearchParams = {}
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.query).toBe('')
    })

    it('filters.genreIds padrão é array vazio', () => {
      mockSearchParams = {}
      const { result } = renderHook(() => useDiscoveryFilters())
      expect(result.current.filters.genreIds).toEqual([])
    })
  })

  describe('handlers', () => {
    it('handleSearch chama navigate com a query e reseta page para 1', () => {
      mockSearchParams = { page: 3 }
      const { result } = renderHook(() => useDiscoveryFilters())
      result.current.handleSearch('interstellar')
      expect(mockNavigate).toHaveBeenCalledOnce()
      const call = mockNavigate.mock.calls[0][0]
      const nextSearch = call.search({ page: 3, query: 'old' })
      expect(nextSearch.query).toBe('interstellar')
      expect(nextSearch.page).toBe(1)
    })

    it('handleSearch com string vazia define query como undefined', () => {
      mockSearchParams = {}
      const { result } = renderHook(() => useDiscoveryFilters())
      result.current.handleSearch('')
      const call = mockNavigate.mock.calls[0][0]
      const nextSearch = call.search({})
      expect(nextSearch.query).toBeUndefined()
    })

    it('handlePage chama navigate apenas com page atualizado', () => {
      mockSearchParams = {}
      const { result } = renderHook(() => useDiscoveryFilters())
      result.current.handlePage(4)
      const call = mockNavigate.mock.calls[0][0]
      const nextSearch = call.search({ query: 'batman', page: 1 })
      expect(nextSearch.page).toBe(4)
      expect(nextSearch.query).toBe('batman')
    })

    it('handleFilters reseta page para 1', () => {
      mockSearchParams = { page: 5 }
      const { result } = renderHook(() => useDiscoveryFilters())
      result.current.handleFilters({ genreIds: ['28'], year: undefined, minRating: undefined, certification: undefined })
      const call = mockNavigate.mock.calls[0][0]
      const nextSearch = call.search({ page: 5 })
      expect(nextSearch.page).toBe(1)
    })

    it('handleFilters define genreIds como undefined para array vazio', () => {
      mockSearchParams = {}
      const { result } = renderHook(() => useDiscoveryFilters())
      result.current.handleFilters({ genreIds: [], year: undefined, minRating: undefined, certification: undefined })
      const call = mockNavigate.mock.calls[0][0]
      const nextSearch = call.search({})
      expect(nextSearch.genreIds).toBeUndefined()
    })

    it('handlePersonChange atualiza personId e personName, reseta page para 1', () => {
      mockSearchParams = { page: 2 }
      const { result } = renderHook(() => useDiscoveryFilters())
      result.current.handlePersonChange(123, 'Keanu Reeves')
      const call = mockNavigate.mock.calls[0][0]
      const nextSearch = call.search({ page: 2 })
      expect(nextSearch.personId).toBe(123)
      expect(nextSearch.personName).toBe('Keanu Reeves')
      expect(nextSearch.page).toBe(1)
    })
  })
})
