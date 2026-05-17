import { toast } from 'sonner'
import { useEffect } from 'react'
import { MovieCard, MovieCardSkeleton } from './movie-card'
import type { Movie, Genre } from '@/shared/api/tmdb.types'

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!isLoading && movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Nenhum filme encontrado</p>
        <p className="text-sm">Tente outros filtros ou termos de busca</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} genres={genres} />
      ))}
    </div>
  )
}
