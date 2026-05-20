import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { WatchlistTable } from './watchlist-table'
import type { WatchlistMovie } from '@/features/watchlist'

vi.mock('@/entities/movie', () => ({
  useGenres: () => ({ data: [{ id: 878, name: 'Ficção Científica' }, { id: 18, name: 'Drama' }] }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) =>
    <a {...props}>{children}</a>,
}))

const makeMovie = (overrides?: Partial<WatchlistMovie>): WatchlistMovie => ({
  id: 1,
  title: 'Duna',
  release_date: '2021-10-22',
  vote_average: 8.1,
  genre_ids: [878],
  ...overrides,
})

const MOVIES: WatchlistMovie[] = [
  makeMovie({ id: 1, title: 'Duna', vote_average: 8.1, release_date: '2021-10-22', genre_ids: [878] }),
  makeMovie({ id: 2, title: 'Oppenheimer', vote_average: 8.4, release_date: '2023-07-21', genre_ids: [18] }),
  makeMovie({ id: 3, title: 'Alien', vote_average: 6.5, release_date: '2024-08-16', genre_ids: [878] }),
]

describe('WatchlistTable', () => {
  const onRemove = vi.fn()

  beforeEach(() => onRemove.mockClear())

  it('renderiza os headers da tabela desktop', () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    expect(screen.getByRole('button', { name: /título/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /gênero/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lançamento/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /faixa/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /rating/i })).toBeInTheDocument()
    expect(screen.getByText('Ações')).toBeInTheDocument()
  })

  it('renderiza todos os filmes', () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    expect(screen.getAllByText('Duna').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Oppenheimer').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Alien').length).toBeGreaterThan(0)
  })

  it('exibe empty state quando lista vazia', () => {
    renderWithProviders(<WatchlistTable movies={[]} onRemove={onRemove} />)
    expect(screen.getByText('Nenhum filme na lista')).toBeInTheDocument()
  })

  it('abre dialog de confirmação ao clicar em remover', async () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    const removeButtons = screen.getAllByRole('button', { name: /remover .+ da lista/i })
    await userEvent.click(removeButtons[0]!)
    expect(screen.getByText('Remover da lista?')).toBeInTheDocument()
  })

  it('chama onRemove ao confirmar no dialog', async () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    const removeButtons = screen.getAllByRole('button', { name: /remover .+ da lista/i })
    await userEvent.click(removeButtons[0]!)
    const confirmBtn = screen.getByRole('button', { name: /^remover$/i })
    await userEvent.click(confirmBtn)
    expect(onRemove).toHaveBeenCalledWith(1)
  })

  it('não chama onRemove ao cancelar no dialog', async () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    const removeButtons = screen.getAllByRole('button', { name: /remover .+ da lista/i })
    await userEvent.click(removeButtons[0]!)
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i })
    await userEvent.click(cancelBtn)
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('ordena por rating ao clicar no header (desktop)', async () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    const ratingHeader = screen.getByRole('button', { name: /rating/i })
    await userEvent.click(ratingHeader)
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0]!).getByText('6.5')).toBeInTheDocument()
  })

  it('ordena por data de lançamento crescente ao clicar no header Lançamento', async () => {
    renderWithProviders(<WatchlistTable movies={MOVIES} onRemove={onRemove} />)
    const dateHeader = screen.getByRole('button', { name: /lançamento/i })
    await userEvent.click(dateHeader)
    const rows = screen.getAllByRole('row').slice(1)
    // 2021 < 2023 < 2024 — Duna primeiro, Alien último
    expect(within(rows[0]!).getAllByText(/duna/i)[0]).toBeInTheDocument()
    expect(within(rows[2]!).getAllByText(/alien/i)[0]).toBeInTheDocument()
  })

  it('ordena por faixa etária usando mapa de pesos semântico', async () => {
    const moviesWithCert: WatchlistMovie[] = [
      makeMovie({ id: 1, title: 'Filme 18', certification: '18' }),
      makeMovie({ id: 2, title: 'Filme L', certification: 'L' }),
      makeMovie({ id: 3, title: 'Filme 12', certification: '12' }),
    ]
    renderWithProviders(<WatchlistTable movies={moviesWithCert} onRemove={onRemove} />)
    const certHeader = screen.getByRole('button', { name: /faixa/i })
    await userEvent.click(certHeader) // asc: L → 12 → 18
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0]!).getAllByText(/filme l/i)[0]).toBeInTheDocument()
    expect(within(rows[2]!).getAllByText(/filme 18/i)[0]).toBeInTheDocument()
  })
})
