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
    user/model/   # useAuthStore (Zustand, sem persist — re-hidratado pelo guard)

  shared/
    api/          # tmdbClient (axios + Bearer), tmdbApi, tipos
    hooks/        # useDebounce, usePageTitle
    ui/           # componentes base (shadcn + Image com skeleton)
    lib/          # cn()
```

---

## Autenticação sem backend

Login valida email + senha via Zod. Ao autenticar, `generateAuthToken()` gera um UUID armazenado em **cookie assinado** com HMAC-SHA256 via `crypto.subtle` (Web Crypto API nativa) — `SameSite=Strict`, `Secure` (HTTPS), `max-age` de 7 dias. O valor é codificado em base64url (`A-Za-z0-9-_`, sem `+`, `/` ou `=`), eliminando URL-encoding e garantindo que qualquer alteração de caractere invalide a assinatura. A chave de assinatura é configurada via `VITE_COOKIE_SIGNING_SECRET`.

O cookie armazena somente o token (`uuid.hmac-sig`). O estado da store (`isAuthenticated`) fica em memória e é repopulado pelo `beforeLoad` a cada carregamento — a sessão sobrevive a reloads enquanto o cookie for válido.

`crypto.randomUUID()` só está disponível em **secure contexts** (HTTPS ou `localhost`) — restrição de spec W3C, não do build. Em HTTP puro (ex: preview sem TLS) o campo é `undefined` e o login quebra. Por isso `generateAuthToken` usa `crypto.randomUUID` quando disponível e cai num gerador UUID v4 manual (`Math.random`) como fallback.

O TanStack Router protege rotas via `beforeLoad` assíncrono no layout route `_authenticated` (pathless), seguindo o padrão recomendado pelas docs com `throw redirect()` e `isRedirect()`. O guard valida o cookie a cada navegação — se o token for ausente, corrompido ou com assinatura inválida, o cookie é removido e o usuário é redirecionado para `/`. Qualquer erro inesperado na validação (ex: falha de crypto) também resulta em redirect, via `catch` com re-throw seletivo. A store é atualizada pelo próprio guard após validação bem-sucedida.

**Limitação conhecida:** a chave de assinatura reside no bundle JavaScript, o que é inerente a SPAs sem backend. A proteção é contra adulteração manual do cookie no browser — não contra XSS ou extração da chave do bundle. `HttpOnly` requereria um servidor.

---

## Desafios com a API TMDB

**Classificação indicativa apenas no endpoint de detalhe.** Os endpoints de listagem (`/trending`, `/discover/movie`) não retornam `certification`. O campo só está disponível em `GET /movie/:id?append_to_response=release_dates`. Consequência: filmes adicionados à watchlist pelo card do grid não têm classificação — só os adicionados pela página de detalhes. Resolver isso exigiria uma request extra por filme ao adicionar, introduzindo N+1 desnecessário para um campo opcional.

**Autenticação via Bearer token.** A API v3 aceita `Authorization: Bearer <access_token>` como alternativa ao `api_key` na URL — mantendo a chave fora de logs de servidor e URLs do browser. O cliente axios usa exclusivamente esse header via `VITE_TMDB_ACCESS_TOKEN`.

---

## Extras

### Performance

Cada página é carregada sob demanda via `lazyRouteComponent` — a API nativa do TanStack Router, que além do code splitting trata reload automático quando hashes de chunk mudam após deploy. Durante o carregamento, a navbar permanece visível e o conteúdo exibe skeleton — sem salto de layout.

---

### Design de referência (Figma)

O projeto conta com um arquivo Figma documentando o style guide, tokens de cor e as principais telas. Ele funciona como **referência visual**.

[CineDash — UI Design](https://www.figma.com/design/x6EvQ28RvxVA1bBx8UFD7D/CineDash-%E2%80%94-UI-Design?m=auto&t=c8qy30SlAx1bJWym-1)

Senha: `3rvv4R\T&I{2nb'j+fIL,MUYF[^7G(0n`

---

### Acessibilidade

Ferramentas de curadoria são usadas em ciclos repetitivos — navegar, filtrar, adicionar à lista, repetir. Interfaces que dependem exclusivamente do mouse introduzem fricção real no workflow e excluem usuários com deficiência motora ou visual. Por isso o projeto foi construído com conformidade WCAG 2.1 nível AAA e WAI-ARIA desde o início:

- **Navegação por teclado completa** com skip-nav link e landmarks semânticos (`<main>`, `<nav aria-label>`, `<aside>`, `<section>`)
- **Formulário de login** com `aria-invalid`, `aria-describedby` em erros, `aria-label="Mostrar senha"` / `"Ocultar senha"` no toggle de senha e `autoComplete` correto — compatível com gerenciadores de senha e leitores de tela
- **Grid de filmes** com `aria-live="polite"` — transições de loading/empty/error anunciadas sem interromper o fluxo de leitura
- **Tabela da watchlist** com `aria-sort` nas colunas ordenáveis; mobile usa `<ul>/<li>` semânticos
- **Botões com contexto completo** — `aria-label="Adicionar Inception à watchlist"` em vez de `"Adicionar"`, eliminando ambiguidade para leitores de tela
- **Paleta verificada contra WCAG 2.1 SC 1.4.6 (Contrast Enhanced, Level AAA)**
- **Touch targets ≥ 44×44px no mobile** (WCAG 2.5.5 AAA / Apple HIG) — todos os elementos interativos usam tamanhos responsivos: 44px por padrão, reduzidos via `sm:` no desktop. Cobre `Button` (todos os variants), `Input`, `InputGroup`, `SelectTrigger`, `CommandInput`, `CommandItem` (`min-h-11`), `SliderControl` + thumb (`after:-inset-4`), e botões custom em `Navbar`, `MovieCard`, `FilterBar`, `WatchlistTable`, `SearchInput` e `LoginForm`

#### Testes de regressão de acessibilidade

Cada atributo ARIA documentado acima tem cobertura de teste dedicada — qualquer remoção acidental quebra o CI antes de chegar à produção. A suite usa [`jest-axe`](https://github.com/nickcolley/jest-axe) (axe-core) para varredura automática de violações WCAG e `@testing-library` para fixar atributos específicos.

| Componente | Atributos/comportamentos cobertos |
|---|---|
| `LoginForm` | `aria-invalid` por campo, `aria-describedby` apontando para `id` do alerta, `role="alert"` nos erros, `autoComplete` nos inputs, `aria-label` dinâmico do toggle de senha (`"Mostrar senha"` / `"Ocultar senha"`), `aria-busy` no submit |
| `WatchlistTable` | `aria-sort="none/ascending/descending"` nas colunas ordenáveis, ausência de `aria-sort` em colunas não ordenáveis, ★ `aria-hidden="true"`, `sr-only "Avaliação:"`, `aria-label` contextual nos botões de remoção |
| `MovieGrid` | `aria-live="polite"` no container, `aria-busy` refletindo estado de loading, `aria-label="Carregando filmes"` na lista skeleton, `role="alert"` no estado de erro, `role="status"` no estado vazio, `aria-label="{n} filmes"` na lista populada |
| `MovieCard` | `aria-label="Ver detalhes de {título}"` no link, `aria-label` e `aria-pressed` do botão watchlist refletindo estado (`"Adicionar"` / `"Remover"` com título), overlay decorativo `aria-hidden="true"`, texto `sr-only` para rating |
| `Navbar` | `<nav aria-label="Principal">`, `aria-current="page"` por rota ativa, contagem de filmes no `aria-label` do link Watchlist, `aria-label` do toggle de tema por modo (`"Ativar modo escuro"` / `"claro"`), `aria-label="Sair da conta"`, ícones decorativos `aria-hidden="true"` |

---

### Segurança

SPAs têm uma superfície de ataque específica que raramente aparece em checklists de code review: credenciais em URLs, dados sensíveis em `localStorage`, inputs externos não sanitizados e ausência de política de conteúdo. O projeto foi auditado contra esses vetores e endurecido em quatro frentes:

**Tokens e credenciais**

- Autenticação usa `crypto.randomUUID()` — mesmo sendo fake
- Token de sessão armazenado em cookie assinado com HMAC-SHA256 (`crypto.subtle`) via `VITE_COOKIE_SIGNING_SECRET`; valor em base64url para que qualquer alteração de caractere quebre a assinatura; `SameSite=Strict` previne CSRF; `HttpOnly` não é aplicável em SPAs sem backend
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
