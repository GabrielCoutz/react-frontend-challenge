import { lazyRouteComponent } from "@tanstack/react-router";

export const LoginPage = lazyRouteComponent(
  () => import("@/pages/login"),
  "LoginPage",
);
export const DiscoveryPage = lazyRouteComponent(
  () => import("@/pages/discovery"),
  "DiscoveryPage",
);
export const MovieDetailsPage = lazyRouteComponent(
  () => import("@/pages/movie-details"),
  "MovieDetailsPage",
);
export const WatchlistPage = lazyRouteComponent(
  () => import("@/pages/watchlist"),
  "WatchlistPage",
);
