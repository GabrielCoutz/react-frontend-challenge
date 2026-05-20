import {
  createRouter,
  createRootRoute,
  createRoute,
  isRedirect,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { z } from "zod";
import { useAuthStore } from "@/entities/user";
import { getSignedAuthToken, removeAuthToken } from "@/shared/utils/cookieStorage";
import { AuthenticatedLayout } from "@/app/layouts/authenticated-layout";
import { LoginPage, DiscoveryPage, MovieDetailsPage, WatchlistPage } from "./lazy-pages";

const discoverySearchSchema = z.object({
  query: z.string().optional(),
  genreIds: z.array(z.string()).optional(),
  year: z.number().optional(),
  minRating: z.number().optional(),
  certification: z.string().optional(),
  personId: z.number().optional(),
  personName: z.string().max(100).optional(),
  page: z.number().optional().default(1),
});

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: async () => {
    try {
      const token = await getSignedAuthToken();
      if (token) throw redirect({ to: "/discovery" });
    } catch (error) {
      if (isRedirect(error)) throw error;
    }
  },
  component: LoginPage,
});

// Layout route sem segmento de path — agrupa todas as rotas protegidas
// O prefixo _ garante que não vira uma rota acessível diretamente
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: async () => {
    try {
      const token = await getSignedAuthToken();
      if (!token) {
        removeAuthToken();
        throw redirect({ to: "/" });
      }
      useAuthStore.setState({ token, isAuthenticated: true });
    } catch (error) {
      if (isRedirect(error)) throw error;
      removeAuthToken();
      throw redirect({ to: "/" });
    }
  },
  component: AuthenticatedLayout,
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
