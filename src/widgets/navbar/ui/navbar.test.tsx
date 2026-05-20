import { screen } from '@testing-library/react'
import { vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { axe } from '@/test/setup'
import { Navbar } from './navbar'

let mockPathname = '/discovery'
let mockTheme = 'light'
let mockWatchlistCount = 0

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params: _p, ...props }: any) => <a href={to} {...props}>{children}</a>,
  useRouterState: ({ select }: any) => select({ location: { pathname: mockPathname } }),
  useNavigate: () => vi.fn(),
}))

vi.mock('@/entities/user', () => ({
  useAuthStore: (selector: any) => selector({ logout: vi.fn(), isAuthenticated: true }),
}))

vi.mock('@/features/watchlist', () => ({
  useWatchlistStore: (selector: any) => selector({ movies: Array(mockWatchlistCount).fill({ id: 1 }) }),
}))

vi.mock('@/features/theme', () => ({
  useThemeStore: () => ({ theme: mockTheme, toggle: vi.fn() }),
}))

describe('Navbar — atributos ARIA', () => {
  beforeEach(() => {
    mockPathname = '/discovery'
    mockTheme = 'light'
    mockWatchlistCount = 0
  })

  it('nav tem aria-label="Principal"', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
  })

  it('logo tem aria-label="CineDash"', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByLabelText('CineDash')).toBeInTheDocument()
  })

  it('link Discovery tem aria-current="page" quando rota é /discovery', () => {
    mockPathname = '/discovery'
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('link', { name: /discovery/i })).toHaveAttribute('aria-current', 'page')
  })

  it('link Discovery não tem aria-current quando rota é outra', () => {
    mockPathname = '/watchlist'
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('link', { name: /discovery/i })).not.toHaveAttribute('aria-current')
  })

  it('link Watchlist tem aria-current="page" quando rota é /watchlist', () => {
    mockPathname = '/watchlist'
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('link', { name: /watchlist/i })).toHaveAttribute('aria-current', 'page')
  })

  it('link Watchlist inclui contagem de filmes no aria-label', () => {
    mockWatchlistCount = 3
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('link', { name: /watchlist.*3 filmes/i })).toBeInTheDocument()
  })

  it('link Watchlist sem contagem não menciona filmes no aria-label', () => {
    mockWatchlistCount = 0
    renderWithProviders(<Navbar />)
    const link = screen.getByRole('link', { name: /watchlist/i })
    expect(link.getAttribute('aria-label')).not.toContain('filmes')
  })

  it('botão de tema tem aria-label "Ativar modo escuro" em modo claro', () => {
    mockTheme = 'light'
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('button', { name: 'Ativar modo escuro' })).toBeInTheDocument()
  })

  it('botão de tema tem aria-label "Ativar modo claro" em modo escuro', () => {
    mockTheme = 'dark'
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('button', { name: 'Ativar modo claro' })).toBeInTheDocument()
  })

  it('botão de logout tem aria-label="Sair da conta"', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('button', { name: 'Sair da conta' })).toBeInTheDocument()
  })

  it('ícones decorativos são aria-hidden', () => {
    const { container } = renderWithProviders(<Navbar />)
    const hiddenIcons = container.querySelectorAll('svg[aria-hidden="true"]')
    expect(hiddenIcons.length).toBeGreaterThan(0)
  })
})

describe('Navbar — acessibilidade', () => {
  beforeEach(() => {
    mockPathname = '/discovery'
    mockTheme = 'light'
    mockWatchlistCount = 0
  })

  it('não tem violações na rota discovery', async () => {
    const { container } = renderWithProviders(<Navbar />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('não tem violações com filmes na watchlist', async () => {
    mockWatchlistCount = 5
    const { container } = renderWithProviders(<Navbar />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('não tem violações em modo escuro', async () => {
    mockTheme = 'dark'
    const { container } = renderWithProviders(<Navbar />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
