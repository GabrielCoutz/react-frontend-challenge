# CineDash — Architecture

## Estrutura de pastas

Feature-Sliced Design (FSD)

```
src/
  app/
    router/       # rotas + auth guard (beforeLoad)
    layouts/      # AuthenticatedLayout
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

### Performance

Cada página é carregada sob demanda via `lazyRouteComponent` — a API nativa do TanStack Router, que além do code splitting expõe `.preload()` para prefetch ao hover em links e trata reload automático quando hashes de chunk mudam após deploy. Durante o carregamento, a navbar permanece visível e o conteúdo exibe skeleton — sem salto de layout.

---

### Design de referência (Figma)

O projeto conta com um arquivo Figma documentando o style guide, tokens de cor e as principais telas. Ele funciona como **referência visual**.

[CineDash — UI Design](https://www.figma.com/design/x6EvQ28RvxVA1bBx8UFD7D/CineDash-%E2%80%94-UI-Design?m=auto&t=c8qy30SlAx1bJWym-1)

Senha: `3rvv4R\T&I{2nb'j+fIL,MUYF[^7G(0n`

---

### Acessibilidade

Ferramentas de curadoria são usadas em ciclos repetitivos — navegar, filtrar, adicionar à lista, repetir. Interfaces que dependem exclusivamente do mouse introduzem fricção real no workflow e excluem usuários com deficiência motora ou visual. Por isso o projeto foi construído com conformidade WCAG 2.1 nível AAA e WAI-ARIA desde o início:

- **Navegação por teclado completa** com skip-nav link e landmarks semânticos (`<main>`, `<nav aria-label>`, `<aside>`, `<section>`)
- **Formulário de login** com `aria-invalid`, `aria-describedby` em erros e `autoComplete` correto — compatível com gerenciadores de senha e leitores de tela
- **Grid de filmes** com `aria-live="polite"` — transições de loading/empty/error anunciadas sem interromper o fluxo de leitura
- **Tabela da watchlist** com `aria-sort` nas colunas ordenáveis; mobile usa `<ul>/<li>` semânticos
- **Botões com contexto completo** — `aria-label="Adicionar Inception à watchlist"` em vez de `"Adicionar"`, eliminando ambiguidade para leitores de tela
- **Paleta verificada contra WCAG 2.1 SC 1.4.6 (Contrast Enhanced, Level AAA)**

---

### Segurança

SPAs têm uma superfície de ataque específica que raramente aparece em checklists de code review: credenciais em URLs, dados sensíveis em `localStorage`, inputs externos não sanitizados e ausência de política de conteúdo. O projeto foi auditado contra esses vetores e endurecido em quatro frentes:

**Tokens e credenciais**

- Autenticação usa `crypto.randomUUID()` — mesmo sendo fake
- Credencial da API TMDB trafega exclusivamente via `Authorization: Bearer` header.

**Política de conteúdo**

- `Content-Security-Policy` restringindo scripts, conexões e frames a origens explicitamente permitidas (TMDB, YouTube)
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` e `Permissions-Policy` bloqueando câmera, microfone e geolocalização

**Validação de dados externos**

- Chave de vídeo da API TMDB validada `/^[A-Za-z0-9_-]{11}$/` antes de compor URL; iframe do YouTube com atributo `sandbox` explícito
- Parâmetros de URL (`personName`, `sort_by`, `id`) validados com tipos estritos e allowlists — strings arbitrárias são descartadas antes de chegar à API
- Leitura do `localStorage` no boot envolta em `try/catch` com allowlist de valores válidos — JSON corrompido não trava a aplicação

**Ferramentas**

- [eslint-plugin-security](https://github.com/eslint-community/eslint-plugin-security) no pipeline de lint — padrões inseguros são flagados em tempo de desenvolvimento
