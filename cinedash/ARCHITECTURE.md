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

---

## Extras

### Design de referência (Figma)

O projeto tem um arquivo Figma com style guide, tokens de cor e as principais telas. Ele serviu como **referência visual**, não como especificação pixel-perfect — pequenas divergências de espaçamento e animação são intencionais no código final. Hover, focus, loading states e breakpoints intermediários estão definidos exclusivamente no código.

[CineDash — UI Design](https://www.figma.com/design/x6EvQ28RvxVA1bBx8UFD7D/CineDash-%E2%80%94-UI-Design)

---

### Acessibilidade

Dashboards internos frequentemente ignoram acessibilidade por assumir que "o usuário é técnico". Isso exclui pessoas com deficiência visual e prejudica navegação por teclado em workflows repetitivos de curadoria — exatamente o caso de uso desta aplicação.

Implementei conformidade com WCAG 2.1 nível AAA e WAI-ARIA, resultando em uma interface utilizável por leitores de tela, navegação por teclado e contraste elevado:

- **Landmarks semânticos:** `<main>`, `<nav aria-label>`, `<aside>`, `<section>` com skip-nav link para pular ao conteúdo principal
- **Formulário de login:** `aria-invalid`, `aria-describedby` nos erros, `autoComplete="email"` e `autoComplete="current-password"` para compatibilidade com gerenciadores de senha
- **Grid de filmes:** `aria-live="polite"` nos estados de loading/empty/error — leitores de tela anunciam mudanças sem interrupção
- **Tabela da watchlist:** `aria-sort` nas colunas ordenáveis; layout mobile usa `<ul>/<li>` semânticos em vez de `<div>`s genéricos
- **Botões contextuais:** `aria-label` inclui o título do filme (`"Adicionar Inception à watchlist"`) em vez de apenas `"Adicionar"`
- **Contraste WCAG AAA verificado:**

| Token | Dark | Light |
|-------|------|-------|
| Texto principal | 19:1 ✅ | 20:1 ✅ |
| Texto secundário | 7.0:1 ✅ | 7.0:1 ✅ |
| Primary (ações) | 5.9:1 ✅ | 7.6:1 ✅ |
| Bordas / UI | 3.3:1 ✅ | 3.2:1 ✅ |

---

### Segurança

Aplicações frontend raramente passam por revisão de segurança formal. Identifiquei e corrigi 14 vulnerabilidades categorizadas por severidade, endurecendo a aplicação contra os vetores de ataque mais comuns em SPAs:

**Tokens e autenticação**
- `generateAuthToken()` migrado de timestamp base-36 (zero entropia, previsível por força bruta) para `crypto.randomUUID()` — token criptograficamente aleatório com 122 bits de entropia
- Tema lido do `localStorage` no boot passou a usar `try/catch` + allowlist `['dark', 'light']` — JSON corrompido não mais trava a aplicação antes do React montar

**Transporte de credenciais**
- API key removida dos query params (visível em logs de servidor, proxies e Sentry) e substituída por `Authorization: Bearer` header — credencial nunca aparece em URLs

**Headers de segurança (dev server)**
- `Content-Security-Policy` restringindo scripts, frames e conexões a origens explicitamente permitidas (TMDB, YouTube)
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` desabilitando câmera/microfone/geolocalização

**Validação de inputs externos**
- `trailer.key` da API TMDB validado contra `/^[A-Za-z0-9_-]{11}$/` antes de compor a URL do iframe
- `sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"` no iframe do YouTube
- `sort_by` passa por allowlist de valores TMDB válidos — strings arbitrárias são descartadas em runtime
- `personName` limitado a 100 caracteres no schema Zod da URL
- `parseInt(id, 10)` substituiu `Number(id)` — elimina `NaN`, `Infinity` e strings arbitrárias como IDs de filme

**Ferramentas**
- `ReactQueryDevtools` protegido por `import.meta.env.DEV` — dados de cache nunca expostos em produção
- `eslint-plugin-security` adicionado ao pipeline de lint — padrões inseguros (`eval`, object injection, regex não-literal) são flagados automaticamente
