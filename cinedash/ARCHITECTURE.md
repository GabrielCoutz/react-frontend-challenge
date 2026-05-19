# CineDash — Architecture

## Estrutura de pastas

Feature-Sliced Design (FSD) — camadas superiores só importam de inferiores:

```
app > pages > widgets > features > entities > shared
```

```
src/
  app/
    router/       # rotas + auth guard (beforeLoad)
    layouts/      # AuthenticatedLayout + Navbar
    providers/    # QueryClientProvider + Toaster

  pages/
    login/
    discovery/    # ui/ + model/ (useDiscoveryFilters)
    movie-details/
    watchlist/

  widgets/
    navbar/
    movie-grid/   # MovieCard + MovieGrid
    movie-table/  # WatchlistTable (TanStack Table)

  features/
    auth/         # LoginForm (RHF + Zod)
    movie-filters/ # FilterBar — gênero, ano, rating, classificação, elenco
    movie-search/ # SearchInput com debounce 400ms
    watchlist/    # useWatchlistStore (Zustand + persist)
    theme/        # useThemeStore (Zustand + persist)

  entities/
    movie/api/    # hooks TanStack Query por endpoint
    user/model/   # useAuthStore (Zustand + persist)

  shared/
    api/          # tmdbClient (axios + Bearer), tmdbApi, tipos
    hooks/        # useDebounce, usePageTitle
    ui/           # componentes base (shadcn + Image com skeleton)
    lib/          # cn()
```

---

## Autenticação sem backend

Login valida email + senha via Zod. Ao autenticar, `generateAuthToken()` gera um UUID via `crypto.randomUUID()` e o Zustand `persist` salva `{ token, isAuthenticated }` em `localStorage` (`auth-storage`).

O TanStack Router protege rotas via `beforeLoad` no layout route `_authenticated` (pathless). Se `isAuthenticated` for falso, redireciona para `/`. A sessão sobrevive ao reload porque o store é reidratado do `localStorage` antes do React montar.

---

## Desafios com a API TMDB

**Classificação indicativa apenas no endpoint de detalhe.** Os endpoints de listagem (`/trending`, `/discover/movie`) não retornam `certification`. O campo só está disponível em `GET /movie/:id?append_to_response=release_dates`. Consequência: filmes adicionados à watchlist pelo card do grid não têm classificação — só os adicionados pela página de detalhes. Resolver isso exigiria uma request extra por filme ao adicionar, introduzindo N+1 desnecessário para um campo opcional.

**Autenticação via Bearer token.** A API v3 aceita `Authorization: Bearer <access_token>` como alternativa ao `api_key` na URL — mantendo a chave fora de logs de servidor e URLs do browser. O cliente axios usa exclusivamente esse header via `VITE_TMDB_ACCESS_TOKEN`.
