# CineDash — Architecture

## Estrutura de pastas

O projeto adota **Feature-Sliced Design (FSD)**, hierarquia onde camadas superiores só importam de camadas inferiores:

```
app > pages > widgets > features > entities > shared
```

```
src/
  app/
    router/         # TanStack Router — rotas + auth guard
    layouts/        # AuthenticatedLayout com Navbar + skip-nav
    providers/      # QueryClientProvider + Sonner Toaster

  pages/
    login/ui/       # Página de login (split-screen)
    discovery/
      ui/           # DiscoveryPage — só renderização
      model/        # useDiscoveryFilters — lógica de URL e queries
    movie-details/ui/
    watchlist/ui/

  widgets/
    navbar/ui/      # Navbar responsiva com contador de watchlist
    movie-grid/ui/  # MovieCard + MovieGrid com skeleton e error state
    movie-table/ui/ # WatchlistTable — TanStack Table + card mobile

  features/
    auth/ui/        # LoginForm (RHF + Zod)
    movie-filters/ui/ # FilterBar — gênero, ano, rating, classificação, elenco
    movie-search/ui/  # SearchInput com debounce 400ms
    watchlist/model/  # useWatchlistStore (Zustand + persist)
    theme/model/      # useThemeStore (Zustand + persist)

  entities/
    movie/api/      # Hooks TanStack Query: trending, search, discover,
                    # movie, credits, videos, genres, certifications
    user/model/     # useAuthStore (Zustand + persist)

  shared/
    api/            # tmdbClient (axios), tmdbApi, tipos TMDB
    hooks/          # useDebounce, usePageTitle
    ui/             # Image (skeleton + fallback)
    lib/            # utils (cn)
```

---

## Decisões técnicas

### Autenticação sem backend

A autenticação é simulada no frontend. Ao fazer login, `generateAuthToken()` cria um token baseado em `crypto.randomUUID()`. O Zustand `persist` middleware salva `{ token, isAuthenticated }` em `localStorage` com a chave `auth-storage`.

No boot, `main.tsx` lê o tema do localStorage antes do React montar (evita flash). O TanStack Router verifica `isAuthenticated` via `beforeLoad` nas rotas protegidas usando o layout route `_authenticated` (pathless, não vira rota acessível).

### Estado de URL como fonte de verdade (Discovery)

Todos os filtros da tela de Discovery (`query`, `genreIds`, `year`, `minRating`, `certification`, `personId`, `page`) vivem na URL via `validateSearch` do TanStack Router com schema Zod. Isso garante:
- Back/forward do browser funcionam corretamente
- URLs são compartilháveis
- Sem estado local duplicado

O hook `useDiscoveryFilters` (`pages/discovery/model/`) encapsula toda a lógica de leitura e escrita da URL, eliminando prop drilling na camada de UI.

### TanStack Query — cache e invalidação

- **Gêneros:** `staleTime: Infinity` — lista não muda, nunca refaz fetch
- **Trending/categorias:** `staleTime: 5min` — dados mudam diariamente
- **Detalhe do filme:** `append_to_response=release_dates` numa única request
- **Lazy loading:** `useGenres(enabled)` e `useCertifications(enabled)` só buscam quando o combobox abre

### TanStack Table (Watchlist)

A `WatchlistTable` renderiza dois layouts com a mesma instância do `useReactTable`:
- **Desktop (sm+):** tabela com `getSortedRowModel` — sorting por Título, Gênero, Rating
- **Mobile:** cards empilhados com `<ul>/<li>` semânticos

O `useMemo` nas column definitions tem `[genres, onRemove]` como deps, garantindo que os nomes de gênero atualizam quando a lista de gêneros carrega.

### Zustand stores

| Store | Persist key | O que persiste |
|-------|------------|----------------|
| `useAuthStore` | `auth-storage` | `token`, `isAuthenticated` |
| `useWatchlistStore` | `watchlist-storage` | `movies[]` (apenas campos necessários) |
| `useThemeStore` | `theme-storage` | `theme` ('dark' \| 'light') |

Ao deslogar, `useWatchlistStore.setState({ movies: [] })` é chamado antes de `logout()`, limpando os dados do utilizador.

### Responsividade

- **Navbar:** ícones apenas em mobile, texto em `sm+`
- **Discovery/Watchlist:** sidebar fixa em `lg+`, Sheet drawer em mobile com contador de filtros ativos
- **WatchlistTable:** tabela em `sm+`, cards empilhados em mobile
- **Movie Details:** `flex-col` mobile → `flex-row` tablet+

### Acessibilidade (WCAG AAA)

Implementado seguindo W3C WAI-ARIA:
- Landmarks: `<main>`, `<nav aria-label>`, `<aside>`, skip-nav link
- `aria-current="page"` nos links ativos da navbar
- `aria-live="polite"` no grid de filmes (loading/empty/error states)
- `aria-sort` nas colunas sortáveis da tabela
- `aria-invalid` + `aria-describedby` nos campos do formulário de login
- `aria-label` contextual nos botões (inclui título do filme)
- Contraste WCAG AAA verificado: texto normal ≥ 7:1, texto large ≥ 4.5:1, UI components ≥ 3:1

### Classificação indicativa (limitação da API)

A TMDB retorna a classificação indicativa por país **apenas** no endpoint de detalhe:

```
GET /movie/:id?append_to_response=release_dates
```

Os endpoints de listagem (`/trending`, `/movie/popular`, `/discover/movie`) **não incluem** o campo `certification` nos objetos de filme retornados.

**Consequência prática:** um filme adicionado à watchlist **só terá a classificação indicativa salva se foi adicionado a partir da página de detalhes** (`/movie/:id`). Filmes adicionados diretamente pelo card do grid de descoberta ficam sem classificação na tabela da watchlist (exibe `—`).

Isso é uma limitação intrínseca da API TMDB e não uma omissão de implementação. A solução completa exigiria uma request adicional por filme (`/movie/:id`) ao adicionar pelo card, introduzindo um N+1 problem desnecessário para um campo opcional.

---

### Cores (Design System)

Paleta verificada contra WCAG 2.1 SC 1.4.6 (Contrast Enhanced, Level AAA):

| Token | Dark | Contraste | Light | Contraste |
|-------|------|-----------|-------|-----------|
| Foreground | `#F8FAFA` | 19:1 ✅ | `#0D0C10` | 20:1 ✅ |
| Muted fg | `#9494A0` | 7.0:1 ✅ | `#525267` | 7.0:1 ✅ |
| Primary | `#F15450` | 5.9:1 ✅ large | `#AA0000` | 7.6:1 ✅ |
| Borders | `#555568` | 3.3:1 ✅ UI | `#8A8A9E` | 3.2:1 ✅ UI |
