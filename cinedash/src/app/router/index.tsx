import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { z } from "zod";
import { useAuthStore } from "@/entities/user/model/auth-store";
import { LoginPage } from "@/pages/login/ui/login-page";
import { DiscoveryPage } from "@/pages/discovery/ui/discovery-page";
import { MovieDetailsPage } from "@/pages/movie-details/ui/movie-details-page";
import { WatchlistPage } from "@/pages/watchlist/ui/watchlist-page";

const discoverySearchSchema = z.object({
  query: z.string().optional(),
  genreId: z.string().optional(),
  year: z.number().optional(),
  minRating: z.number().optional(),
  page: z.number().optional().default(1),
});

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();

    if (isAuthenticated) throw redirect({ to: "/discovery" });
  },
  component: LoginPage,
});

// Layout route sem segmento de path — agrupa todas as rotas protegidas
// O prefixo _ garante que não vira uma rota acessível diretamente
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) throw redirect({ to: "/" });
  },
  component: () => <Outlet />,
});

const discoveryRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/discovery",
  validateSearch: discoverySearchSchema,
  component: DiscoveryPage,
});

const movieDetailsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/movie/$id",
  component: MovieDetailsPage,
});

const watchlistRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/watchlist",
  component: WatchlistPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    discoveryRoute,
    movieDetailsRoute,
    watchlistRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
