import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import { Film, List, LogOut, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/entities/user/model/auth-store'
import { useWatchlistStore } from '@/features/watchlist/model/watchlist-store'
import { useThemeStore } from '@/features/theme/model/theme-store'

export function Navbar() {
  const logout = useAuthStore((s) => s.logout)
  const watchlistCount = useWatchlistStore((s) => s.movies.length)
  const { theme, toggle } = useThemeStore()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  const discoveryActive = pathname.startsWith('/discovery')
  const watchlistActive = pathname === '/watchlist'

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
      <span className="font-mono text-sm sm:text-base font-bold uppercase tracking-widest text-primary shrink-0" aria-label="CineDash">
        Cinedash
      </span>

      <nav aria-label="Principal" className="flex flex-1 items-center gap-0.5">
        <Link
          to="/discovery"
          aria-label="Discovery"
          aria-current={discoveryActive ? 'page' : undefined}
          className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
            discoveryActive
              ? 'text-foreground border-b-2 border-primary rounded-none pb-[5px]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Film className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Discovery</span>
        </Link>

        <Link
          to="/watchlist"
          aria-label={`Watchlist${watchlistCount > 0 ? `, ${watchlistCount} filmes` : ''}`}
          aria-current={watchlistActive ? 'page' : undefined}
          className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
            watchlistActive
              ? 'text-foreground border-b-2 border-primary rounded-none pb-[5px]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <List className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Watchlist</span>
          {watchlistCount > 0 && (
            <span aria-hidden="true" className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground">
              {watchlistCount}
            </span>
          )}
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          {theme === 'dark'
            ? <Sun className="h-4 w-4" aria-hidden="true" />
            : <Moon className="h-4 w-4" aria-hidden="true" />}
        </button>

        <button
          onClick={handleLogout}
          aria-label="Sair da conta"
          className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline" aria-hidden="true">Sair</span>
        </button>
      </div>
    </header>
  )
}
