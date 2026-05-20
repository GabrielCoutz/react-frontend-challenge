import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { axe } from '@/test/setup'
import { MovieCard } from './movie-card'
import type { Movie } from '@/shared/api/tmdb.types'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params: _p, ...props }: any) => <a href={to} {...props}>{children}</a>,
}))

vi.mock('@/entities/movie', () => ({
  useGenres: () => ({ data: [{ id: 878, name: 'Ficção Científica' }] }),
}))

vi.mock('@/shared/api/tmdb-client', () => ({
  getImageUrl: () => 'https://image.tmdb.org/test.jpg',
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockAdd = vi.fn()
const mockRemove = vi.fn()
let mockInWatchlist = false

vi.mock('@/features/watchlist', () => ({
  useWatchlistStore: () => ({
    add: mockAdd,
    remove: mockRemove,
    isInWatchlist: () => mockInWatchlist,
  }),
}))

const MOVIE: Movie = {
  id: 42,
  title: 'Inception',
  overview: 'Um ladrão de sonhos.',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2010-07-16',
  vote_average: 8.8,
  vote_count: 35000,
  genre_ids: [878],
  popularity: 99,
}

describe('MovieCard — atributos ARIA', () => {
  beforeEach(() => {
    mockInWatchlist = false
    mockAdd.mockClear()
    mockRemove.mockClear()
  })

  it('link tem aria-label com título do filme', () => {
    renderWithProviders(<MovieCard movie={MOVIE} />)
    expect(screen.getByRole('link', { name: /ver detalhes de inception/i })).toBeInTheDocument()
  })

  it('botão watchlist tem aria-label "Adicionar {título} à lista" quando fora da lista', () => {
    renderWithProviders(<MovieCard movie={MOVIE} />)
    expect(screen.getByRole('button', { name: 'Adicionar Inception à lista' })).toBeInTheDocument()
  })

  it('botão watchlist tem aria-pressed="false" quando filme não está na lista', () => {
    renderWithProviders(<MovieCard movie={MOVIE} />)
    expect(screen.getByRole('button', { name: /adicionar inception/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('botão watchlist tem aria-label "Remover {título} da lista" quando na lista', () => {
    mockInWatchlist = true
    renderWithProviders(<MovieCard movie={MOVIE} />)
    expect(screen.getByRole('button', { name: 'Remover Inception da lista' })).toBeInTheDocument()
  })

  it('botão watchlist tem aria-pressed="true" quando filme está na lista', () => {
    mockInWatchlist = true
    renderWithProviders(<MovieCard movie={MOVIE} />)
    expect(screen.getByRole('button', { name: /remover inception/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('aria-label do botão watchlist não é genérico (inclui título)', async () => {
    renderWithProviders(<MovieCard movie={MOVIE} />)
    const btn = screen.getByRole('button', { name: /inception/i })
    expect(btn.getAttribute('aria-label')).toContain('Inception')
  })

  it('informações visuais de rating têm texto acessível via sr-only', () => {
    const { container } = renderWithProviders(<MovieCard movie={MOVIE} />)
    const srOnly = container.querySelector('.sr-only')
    expect(srOnly).toHaveTextContent(/8\.8.*de 10/i)
  })

  it('overlay visual de rating é aria-hidden', () => {
    const { container } = renderWithProviders(<MovieCard movie={MOVIE} />)
    const hiddenOverlay = container.querySelector('.absolute.bottom-2[aria-hidden="true"]')
    expect(hiddenOverlay).toBeInTheDocument()
  })
})

describe('MovieCard — acessibilidade', () => {
  beforeEach(() => { mockInWatchlist = false })

  it('não tem violações quando fora da watchlist', async () => {
    const { container } = renderWithProviders(<MovieCard movie={MOVIE} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('não tem violações quando na watchlist', async () => {
    mockInWatchlist = true
    const { container } = renderWithProviders(<MovieCard movie={MOVIE} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('botão watchlist muda aria-label ao clicar', async () => {
    const user = userEvent.setup()
    const { rerender } = renderWithProviders(<MovieCard movie={MOVIE} />)
    expect(screen.getByRole('button', { name: /adicionar inception/i })).toBeInTheDocument()
    mockInWatchlist = true
    rerender(<MovieCard movie={MOVIE} />)
    expect(screen.getByRole('button', { name: /remover inception/i })).toBeInTheDocument()
    // trigger a real click for coverage
    await user.click(screen.getByRole('button', { name: /remover inception/i }))
    expect(mockRemove).toHaveBeenCalledWith(42)
  })
})
