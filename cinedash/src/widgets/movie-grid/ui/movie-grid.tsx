import { toast } from 'sonner'
import { useEffect } from 'react'
import { MovieCard, MovieCardSkeleton } from './movie-card'
import type { Movie, Genre } from '@/shared/api/tmdb.types'

const GRID_COLS = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'

interface MovieGridProps {
  movies: Movie[]
  genres: Genre[]
  isLoading: boolean
  isError: boolean
}

export function MovieGrid({ movies, genres, isLoading, isError }: MovieGridProps) {
  useEffect(() => {
    if (isError) toast.error('Falha ao carregar filmes. Tente novamente.')
  }, [isError])

  return (
    <div aria-live="polite" aria-busy={isLoading}>
      {isLoading ? (
        <ul className={GRID_COLS} aria-label="Carregando filmes">
          {Array.from({ length: 20 }).map((_, i) => (
            <li key={i}>
              <MovieCardSkeleton />
            </li>
          ))}
        </ul>
      ) : movies.length === 0 ? (
        <div role="status" className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">Nenhum filme encontrado</p>
          <p className="text-sm">Tente outros filtros ou termos de busca</p>
        </div>
      ) : (
        <ul className={GRID_COLS} aria-label={`${movies.length} filmes`}>
          {movies.map((movie) => (
            <li key={movie.id}>
              <MovieCard movie={movie} genres={genres} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
