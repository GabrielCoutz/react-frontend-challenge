import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { axe } from '@/test/setup'
import { MovieGrid } from './movie-grid'
import type { Movie } from '@/shared/api/tmdb.types'

vi.mock('./movie-card', () => ({
  MovieCard: ({ movie }: { movie: Movie }) => <div>{movie.title}</div>,
  MovieCardSkeleton: () => <div />,
}))

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const makeMovie = (id: number, title: string): Movie => ({
  id, title, overview: '', poster_path: null, backdrop_path: null,
  release_date: '2021-01-01', vote_average: 7.0, vote_count: 100,
  genre_ids: [18], popularity: 1,
})

const MOVIES: Movie[] = [makeMovie(1, 'Duna'), makeMovie(2, 'Oppenheimer'), makeMovie(3, 'Alien')]

describe('MovieGrid — atributos ARIA', () => {
  it('container raiz tem aria-live="polite"', () => {
    const { container } = renderWithProviders(
      <MovieGrid movies={[]} isLoading={false} isError={false} />
    )
    expect(container.firstElementChild).toHaveAttribute('aria-live', 'polite')
  })

  it('estado de loading: aria-busy="true" e lista nomeada "Carregando filmes"', () => {
    const { container } = renderWithProviders(
      <MovieGrid movies={[]} isLoading={true} isError={false} />
    )
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('list', { name: 'Carregando filmes' })).toBeInTheDocument()
  })

  it('estado de erro tem role="alert"', () => {
    renderWithProviders(
      <MovieGrid movies={[]} isLoading={false} isError={true} onRetry={vi.fn()} />
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('estado vazio tem role="status"', () => {
    renderWithProviders(
      <MovieGrid movies={[]} isLoading={false} isError={false} />
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('lista de filmes tem aria-label com contagem', () => {
    renderWithProviders(
      <MovieGrid movies={MOVIES} isLoading={false} isError={false} />
    )
    expect(screen.getByRole('list', { name: '3 filmes' })).toBeInTheDocument()
  })

  it('container aria-busy="false" quando não está carregando', () => {
    const { container } = renderWithProviders(
      <MovieGrid movies={MOVIES} isLoading={false} isError={false} />
    )
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'false')
  })
})

describe('MovieGrid — acessibilidade', () => {
  it('não tem violações com filmes carregados', async () => {
    const { container } = renderWithProviders(
      <MovieGrid movies={MOVIES} isLoading={false} isError={false} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('não tem violações no estado de loading', async () => {
    const { container } = renderWithProviders(
      <MovieGrid movies={[]} isLoading={true} isError={false} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('não tem violações no estado de erro', async () => {
    const { container } = renderWithProviders(
      <MovieGrid movies={[]} isLoading={false} isError={true} onRetry={vi.fn()} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('não tem violações no estado vazio', async () => {
    const { container } = renderWithProviders(
      <MovieGrid movies={[]} isLoading={false} isError={false} />
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
