import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { WatchlistTable } from './watchlist-table'
import type { Movie } from '@/shared/api/tmdb.types'

vi.mock('@/entities/movie/api/use-genres', () => ({
  useGenres: () => ({ data: [{ id: 878, name: 'Ficção Científica' }, { id: 18, name: 'Drama' }] }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) =>
    <a {...props}>{children}</a>,
}))

const makeMovie = (overrides?: Partial<Movie>): Movie => ({
  id: 1,
  title: 'Duna',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2021-10-22',
  vote_average: 8.1,
  vote_count: 1000,
  genre_ids: [878],
  popularity: 500,
  ...overrides,
})

const MOVIES: Movie[] = [
  makeMovie({ id: 1, title: 'Duna', vote_average: 8.1, release_date: '2021-10-22', genre_ids: [878] }),
  makeMovie({ id: 2, title: 'Oppenheimer', vote_average: 8.4, release_date: '2023-07-21', genre_ids: [18] }),
  makeMovie({ id: 3, title: 'Alien', vote_average: 6.5, release_date: '2024-08-16', genre_ids: [878] }),
]

describe('WatchlistTable', () => {
  const onRemove = vi.fn()

  beforeEach(() => onRemove.mockClear())

  it('renderiza os headers corretos', () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Gênero')).toBeInTheDocument()
    expect(screen.getByText('Data')).toBeInTheDocument()
    expect(screen.getByText('Rating')).toBeInTheDocument()
    expect(screen.getByText('Ações')).toBeInTheDocument()
  })

  it('renderiza todos os filmes', () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    expect(screen.getByText('Duna')).toBeInTheDocument()
    expect(screen.getByText('Oppenheimer')).toBeInTheDocument()
    expect(screen.getByText('Alien')).toBeInTheDocument()
  })

  it('exibe empty state quando lista vazia', () => {
    renderWithProviders(<WatchlistTable movies={[]} onRemove={onRemove} />)
    expect(screen.getByText('Nenhum filme na lista')).toBeInTheDocument()
  })

  it('chama onRemove com o id correto ao clicar em remover', async () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    const removeButtons = screen.getAllByRole('button', { name: /remover da lista/i })
    await userEvent.click(removeButtons[0]!)
    expect(onRemove).toHaveBeenCalledWith(1)
  })

  it('filtra filmes pelo título', async () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    const input = screen.getByPlaceholderText('Buscar por título...')
    await userEvent.type(input, 'duna')
    expect(screen.getByText('Duna')).toBeInTheDocument()
    expect(screen.queryByText('Oppenheimer')).not.toBeInTheDocument()
  })

  it('ordena por rating ao clicar no header', async () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    const ratingHeader = screen.getByRole('button', { name: /rating/i })
    await userEvent.click(ratingHeader)

    const rows = screen.getAllByRole('row').slice(1)
    const firstCell = within(rows[0]!).getByText(/★/)
    expect(firstCell.textContent).toContain('6.5')
  })

  it('exibe contador de filmes', () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    expect(screen.getByText(`${MOVIES.length} de ${MOVIES.length} filmes`)).toBeInTheDocument()
  })
})
