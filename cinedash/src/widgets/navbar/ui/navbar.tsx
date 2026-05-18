import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Film, List, LogOut } from "lucide-react";
import { useAuthStore } from "@/entities/user/model/auth-store";
import { useWatchlistStore } from "@/features/watchlist/model/watchlist-store";

export function Navbar() {
  const logout = useAuthStore((s) => s.logout);
  const watchlistCount = useWatchlistStore((s) => s.movies.length);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-6 border-b border-border bg-card px-6">
      <span className="font-mono text-base font-bold uppercase tracking-widest text-primary">
        Cinedash
      </span>

      <nav className="flex flex-1 items-center gap-1">
        <Link
          to="/discovery"
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            pathname.startsWith("/discovery")
              ? "text-foreground border-b-2 border-primary rounded-none pb-[5px]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Film className="h-4 w-4" />
          Discovery
        </Link>

        <Link
          to="/watchlist"
          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            pathname === "/watchlist"
              ? "text-foreground border-b-2 border-primary rounded-none pb-[5px]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <List className="h-4 w-4" />
          Watchlist
          {watchlistCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground">
              {watchlistCount}
            </span>
          )}
        </Link>
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sair
      </button>
    </header>
  );
}
