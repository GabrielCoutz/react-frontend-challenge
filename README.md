## O que foi feito

Implementação completa do **[CineDash](https://github.com/buzzmates/react-frontend-challenge/blob/main/cases/01-cinedash.md)**, dashboard de curadoria e descoberta de filmes via [TMDB API](https://developer.themoviedb.org/docs/getting-started), cobrindo todos os requisitos obrigatórios e com extras de qualidade.

### Funcionalidades

- **Autenticação simulada** — login com validação [Zod](https://zod.dev/), token via [crypto.randomUUID](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID), sessão protegida por route guard no [TanStack Router](https://tanstack.com/router/latest)
- **Dashboard de descoberta** — trending semanal, busca com debounce 400ms, filtros avançados (gênero, ano, rating, classificação indicativa, elenco), paginação e estado de URL como fonte de verdade
- **Watchlist** — adicionar/remover com confirmação, tabela sortável ([TanStack Table](https://tanstack.com/table/latest)), filtros locais por título/gênero/ano/rating, layout responsivo com drawer mobile
- **Detalhes do filme** — sinopse, elenco, trailer via iframe YouTube, botão watchlist e classificação indicativa
- **Tema dark/light** — toggle persistido via Zustand

### Arquitetura

- **[Feature-Sliced Design (FSD)](https://feature-sliced.design/)** — `app > pages > widgets > features > entities > shared`, com `index.ts` público em cada slice
- **Code splitting por rota** — `lazyRouteComponent` (API nativa do [TanStack Router](https://tanstack.com/router/v1/docs/api/router/lazyRouteComponentFunction)) com skeleton.
- **[TanStack Query](https://tanstack.com/query/latest)** — staleTime configurado por endpoint, lazy fetch (por demanda) em gêneros e certificações, evitando requests desnecessárias.

### Extras

- **Segurança** — CSP, headers HTTP, Bearer token auth, validação de inputs externos (trailer key, sort_by allowlist, parseInt para IDs), `[eslint-plugin-security](https://github.com/eslint-community/eslint-plugin-security)`; token de sessão em **cookie assinado com HMAC-SHA256** ([Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)) com `SameSite=Strict` e assinatura em base64url
- **Acessibilidade WCAG 2.1 AAA** — skip-nav, landmarks semânticos, `aria-live`, `aria-sort`, `aria-label` contextuais, contraste verificado
- **Testes** — 109 testes unitários cobrindo stores, hooks, regras de negócio e assinatura HMAC do cookie

## Como testar

### Pré-requisitos

1. Copiar `.env.local.example` → `.env.local`
2. Preencher `VITE_TMDB_ACCESS_TOKEN` com o **API Read Access Token** de [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
3. Preencher `VITE_TMDB_BASE_URL=https://api.themoviedb.org/3` e `VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p`
4. (Opcional) Preencher `VITE_COOKIE_SIGNING_SECRET` com uma string aleatória longa — se omitido, usa fallback de desenvolvimento

### Rodar

```bash
npm install
npm run build
npm run preview   # http://localhost:4173
```

**Login:** qualquer email válido + senha com 6+ caracteres

### Testes

```bash
npm test
```

## Documentação

- [INSTRUCTIONS.md](./INSTRUCTIONS.md) — setup detalhado
- [ARCHITECTURE.md](./ARCHITECTURE.md) — decisões técnicas
