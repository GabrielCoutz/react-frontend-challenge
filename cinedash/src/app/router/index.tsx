import { createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router'
import { LoginPage } from '@/pages/login/ui/login-page'
import { DiscoveryPage } from '@/pages/discovery/ui/discovery-page'
import { MovieDetailsPage } from '@/pages/movie-details/ui/movie-details-page'
import { WatchlistPage } from '@/pages/watchlist/ui/watchlist-page'

// TODO: [TanStack Router] Importar useAuthStore e implementar beforeLoad nas rotas protegidas
// Exemplo de auth guard:
//
// import { useAuthStore } from '@/entities/user/model/auth-store'
//
// beforeLoad: ({ context }) => {
//   const isAuth = useAuthStore.getState().isAuth
//   if (!isAuth) throw redirect({ to: '/' })
// }
//
// Referência: https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
})

// TODO: [TanStack Router] adicionar beforeLoad com auth guard nas rotas abaixo
const discoveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discovery',
  component: DiscoveryPage,
})

const movieDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/movie/$id',
  component: MovieDetailsPage,
})

const watchlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/watchlist',
  component: WatchlistPage,
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  discoveryRoute,
  movieDetailsRoute,
  watchlistRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
