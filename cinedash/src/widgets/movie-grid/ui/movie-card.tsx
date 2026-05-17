import { Link } from '@tanstack/react-router'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getImageUrl } from '@/shared/api/tmdb-client'
import type { Movie, Genre } from '@/shared/api/tmdb.types'

interface MovieCardProps {
  movie: Movie
  genres?: Genre[]
}

export function MovieCard({ movie, genres = [] }: MovieCardProps) {
  const posterUrl = getImageUrl(movie.poster_path, 'w342')
  const year = movie.release_date?.slice(0, 4)
  const movieGenres = genres.filter((g) => movie.genre_ids.includes(g.id)).slice(0, 2)

  return (
    <Link to="/movie/$id" params={{ id: String(movie.id)  }}>
      <Card className="overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer h-full">
        <div className="aspect-[2/3] relative bg-muted">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Sem imagem
            </div>
          )}
        </div>
        <CardContent className="p-3 space-y-2">
          <p className="font-semibold text-sm leading-tight line-clamp-2">{movie.title}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{movie.vote_average.toFixed(1)}</span>
              {year && <span>· {year}</span>}
            </div>
          </div>
          {movieGenres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movieGenres.map((g) => (
                <Badge key={g.id} variant="secondary" className="text-xs px-1.5 py-0">
                  {g.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export function MovieCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[2/3] w-full" />
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-16" />
      </CardContent>
    </Card>
  )
}
