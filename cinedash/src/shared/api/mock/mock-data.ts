import type { Movie, Genre, Cast, Video, PaginatedResponse, CreditsResponse, VideosResponse } from '../tmdb.types'

export const MOCK_GENRES: Genre[] = [
  { id: 28, name: 'Ação' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animação' },
  { id: 35, name: 'Comédia' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentário' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Família' },
  { id: 14, name: 'Fantasia' },
  { id: 27, name: 'Terror' },
  { id: 9648, name: 'Mistério' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ficção Científica' },
  { id: 53, name: 'Suspense' },
]

export const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: 'Duna: Parte Dois',
    overview: 'Paul Atreides une forças com Chani e os Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.',
    poster_path: '/mock/dune2.jpg',
    backdrop_path: '/mock/dune2-backdrop.jpg',
    release_date: '2024-03-01',
    vote_average: 8.4,
    vote_count: 4200,
    genre_ids: [878, 12, 28],
    genres: [
      { id: 878, name: 'Ficção Científica' },
      { id: 12, name: 'Aventura' },
      { id: 28, name: 'Ação' },
    ],
    popularity: 980.5,
  },
  {
    id: 2,
    title: 'Oppenheimer',
    overview: 'A história de J. Robert Oppenheimer e seu papel no desenvolvimento da bomba atômica durante a Segunda Guerra Mundial.',
    poster_path: '/mock/oppenheimer.jpg',
    backdrop_path: '/mock/oppenheimer-backdrop.jpg',
    release_date: '2023-07-21',
    vote_average: 8.1,
    vote_count: 6800,
    genre_ids: [18, 53, 80],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 53, name: 'Suspense' },
      { id: 80, name: 'Crime' },
    ],
    popularity: 750.2,
  },
  {
    id: 3,
    title: 'Pobres Criaturas',
    overview: 'A fantástica evolução de Bella Baxter, uma jovem mulher trazida de volta à vida pelo brilhante e excêntrico cientista Dr. Godwin Baxter.',
    poster_path: '/mock/poor-things.jpg',
    backdrop_path: '/mock/poor-things-backdrop.jpg',
    release_date: '2023-12-08',
    vote_average: 7.9,
    vote_count: 3100,
    genre_ids: [18, 35, 14],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 35, name: 'Comédia' },
      { id: 14, name: 'Fantasia' },
    ],
    popularity: 620.8,
  },
  {
    id: 4,
    title: 'Godzilla e Kong: O Novo Império',
    overview: 'Os titãs Godzilla e Kong enfrentam uma ameaça colossal escondida dentro do nosso mundo, desafiando a própria existência da civilização humana.',
    poster_path: '/mock/godzilla-kong.jpg',
    backdrop_path: '/mock/godzilla-kong-backdrop.jpg',
    release_date: '2024-03-29',
    vote_average: 6.7,
    vote_count: 2900,
    genre_ids: [28, 12, 878],
    genres: [
      { id: 28, name: 'Ação' },
      { id: 12, name: 'Aventura' },
      { id: 878, name: 'Ficção Científica' },
    ],
    popularity: 890.1,
  },
  {
    id: 5,
    title: 'Zona de Interesse',
    overview: 'O comandante de Auschwitz, Rudolf Höss, e sua esposa constroem uma vida dos sonhos ao lado do campo de concentração.',
    poster_path: '/mock/zone-of-interest.jpg',
    backdrop_path: '/mock/zone-of-interest-backdrop.jpg',
    release_date: '2023-12-15',
    vote_average: 7.5,
    vote_count: 1800,
    genre_ids: [18, 53],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 53, name: 'Suspense' },
    ],
    popularity: 410.3,
  },
  {
    id: 6,
    title: 'Deadpool & Wolverine',
    overview: 'Wade Wilson se junta ao Wolverine e enfrenta uma ameaça que coloca o multiverso em risco.',
    poster_path: '/mock/deadpool-wolverine.jpg',
    backdrop_path: '/mock/deadpool-wolverine-backdrop.jpg',
    release_date: '2024-07-26',
    vote_average: 7.8,
    vote_count: 5500,
    genre_ids: [28, 35, 12],
    genres: [
      { id: 28, name: 'Ação' },
      { id: 35, name: 'Comédia' },
      { id: 12, name: 'Aventura' },
    ],
    popularity: 1200.4,
  },
  {
    id: 7,
    title: 'Alien: Romulus',
    overview: 'Um grupo de jovens colonizadores do espaço se vê frente a frente com a forma de vida mais aterrorizante do universo.',
    poster_path: '/mock/alien-romulus.jpg',
    backdrop_path: '/mock/alien-romulus-backdrop.jpg',
    release_date: '2024-08-16',
    vote_average: 7.3,
    vote_count: 3200,
    genre_ids: [27, 878, 53],
    genres: [
      { id: 27, name: 'Terror' },
      { id: 878, name: 'Ficção Científica' },
      { id: 53, name: 'Suspense' },
    ],
    popularity: 760.9,
  },
  {
    id: 8,
    title: 'Divertida Mente 2',
    overview: 'Riley entra na adolescência e novas emoções chegam ao QG: Ansiedade, Inveja, Tédio e Nostalgia.',
    poster_path: '/mock/inside-out-2.jpg',
    backdrop_path: '/mock/inside-out-2-backdrop.jpg',
    release_date: '2024-06-14',
    vote_average: 7.6,
    vote_count: 4800,
    genre_ids: [16, 35, 10751],
    genres: [
      { id: 16, name: 'Animação' },
      { id: 35, name: 'Comédia' },
      { id: 10751, name: 'Família' },
    ],
    popularity: 1100.6,
  },
]

export const MOCK_CREDITS: Record<number, CreditsResponse> = {
  1: {
    id: 1,
    cast: [
      { id: 101, name: 'Timothée Chalamet', character: 'Paul Atreides', profile_path: null, order: 0 },
      { id: 102, name: 'Zendaya', character: 'Chani', profile_path: null, order: 1 },
      { id: 103, name: 'Rebecca Ferguson', character: 'Lady Jessica', profile_path: null, order: 2 },
      { id: 104, name: 'Josh Brolin', character: 'Gurney Halleck', profile_path: null, order: 3 },
      { id: 105, name: 'Austin Butler', character: 'Feyd-Rautha', profile_path: null, order: 4 },
    ],
  },
  2: {
    id: 2,
    cast: [
      { id: 201, name: 'Cillian Murphy', character: 'J. Robert Oppenheimer', profile_path: null, order: 0 },
      { id: 202, name: 'Emily Blunt', character: 'Katherine Oppenheimer', profile_path: null, order: 1 },
      { id: 203, name: 'Matt Damon', character: 'General Leslie Groves', profile_path: null, order: 2 },
      { id: 204, name: 'Robert Downey Jr.', character: 'Lewis Strauss', profile_path: null, order: 3 },
      { id: 205, name: 'Florence Pugh', character: 'Jean Tatlock', profile_path: null, order: 4 },
    ],
  },
}

export const MOCK_VIDEOS: Record<number, VideosResponse> = {
  1: {
    id: 1,
    results: [
      { id: 'v1', key: 'Way9TE_V8MQ', name: 'Dune: Part Two | Official Trailer', site: 'YouTube', type: 'Trailer', official: true },
    ],
  },
  2: {
    id: 2,
    results: [
      { id: 'v2', key: 'uYPbbksJxIg', name: 'Oppenheimer | Official Trailer', site: 'YouTube', type: 'Trailer', official: true },
    ],
  },
}

export function mockPaginated(movies: Movie[], page = 1, perPage = 20): PaginatedResponse<Movie> {
  const start = (page - 1) * perPage
  const results = movies.slice(start, start + perPage)
  return {
    page,
    results,
    total_pages: Math.ceil(movies.length / perPage),
    total_results: movies.length,
  }
}
