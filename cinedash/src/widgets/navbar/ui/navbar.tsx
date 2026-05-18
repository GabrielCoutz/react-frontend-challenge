import { Link, useRouterState } from '@tanstack/react-router'
import { Film, List } from 'lucide-react'
import { useAuthStore } from '@/entities/user/model/auth-store'

export function Navbar() {
  const logout = useAuthStore((s) => s.logout)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-6 border-b border-border bg-card px-6">
      <span className="font-mono text-base font-bold uppercase tracking-widest text-primary">
        Cinedash
      </span>

      <nav className="flex flex-1 items-center gap-1">
        <Link
          to="/discovery"
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            pathname.startsWith('/discovery')
              ? 'text-foreground border-b-2 border-primary rounded-none pb-[5px]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Film className="h-4 w-4" />
          Discovery
        </Link>

        <Link
          to="/watchlist"
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            pathname === '/watchlist'
              ? 'text-foreground border-b-2 border-primary rounded-none pb-[5px]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <List className="h-4 w-4" />
          Watchlist
        </Link>
      </nav>

      <button
        onClick={logout}
        className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors"
      >
        Sair
      </button>
    </header>
  )
}
