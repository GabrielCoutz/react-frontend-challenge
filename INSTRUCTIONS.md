# CineDash — Instructions

## Projeto escolhido

**CineDash** — Dashboard de curadoria e descoberta de filmes via TMDB API.

---

## Pré-requisitos

- Node.js 18+
- Conta gratuita em [themoviedb.org](https://www.themoviedb.org/)

---

## Configuração

### 1. Instalar dependências

```bash
cd cinedash
npm install
```

### 2. Variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.local.example .env.local
```

```env
VITE_TMDB_ACCESS_TOKEN=seu_token_aqui
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

Para obter o token:

1. Acesse [themoviedb.org](https://www.themoviedb.org/) e crie uma conta
2. Vá em **Settings → API**
3. Copie o **API Read Access Token** (o campo longo, não a API Key curta)

---

## Rodando o projeto

```bash
npm run build
npm run preview      # http://localhost:4173
```

**Login (simulado):** qualquer email válido + senha com 6+ caracteres.

---

## Testes

```bash
npm test             # todos os testes
npm run test:ui      # interface visual
npm run coverage     # cobertura
```
