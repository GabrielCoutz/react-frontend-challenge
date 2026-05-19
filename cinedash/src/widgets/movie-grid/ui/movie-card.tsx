import { Link } from '@tanstack/react-router'
import { Star, Plus, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getImageUrl } from '@/shared/api/tmdb-client'
import { useWatchlistStore } from '@/features/watchlist/model/watchlist-store'
import { Image } from '@/shared/ui/image'
import type { Movie, Genre } from '@/shared/api/tmdb.types'

interface MovieCardProps {
  movie: Movie
  genres?: Genre[]
}

export function MovieCard({ movie, genres = [] }: MovieCardProps) {
  const { add, remove, isInWatchlist } = useWatchlistStore()
  const inWatchlist = isInWatchlist(movie.id)

  const imageUrl = getImageUrl(movie.backdrop_path, 'w780')

  const year = movie.release_date?.slice(0, 4)
  const movieGenres = genres.filter((g) => movie.genre_ids.includes(g.id)).slice(0, 2)

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWatchlist) {
      remove(movie.id)
      toast.success(`"${movie.title}" removido da lista`)
    } else {
      add({
        id: movie.id,
        title: movie.title,
        genre_ids: movie.genre_ids,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
      })
      toast.success(`"${movie.title}" adicionado à lista`)
    }
  }

  return (
    <Link
      to="/movie/$id"
      params={{ id: String(movie.id) }}
      aria-label={`Ver detalhes de ${movie.title}`}
    >
      <Card className="group overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer flex flex-col h-full">
        <div className="aspect-video relative bg-muted">
          <Image src={imageUrl} alt={movie.title} className="w-full h-full object-cover" />

          <button
            onClick={handleWatchlist}
            className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border transition-all cursor-pointer ${
              inWatchlist
                ? 'bg-primary border-primary text-primary-foreground opacity-100'
                : 'bg-background/80 border-border text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground backdrop-blur-sm opacity-0 group-hover:opacity-100'
            }`}
            aria-label={inWatchlist ? `Remover ${movie.title} da lista` : `Adicionar ${movie.title} à lista`}
            aria-pressed={inWatchlist}
          >
            {inWatchlist
              ? <Check className="h-3.5 w-3.5" aria-hidden="true" />
              : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>

          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" aria-hidden="true" />

          <div className="absolute bottom-2 left-2 flex items-center gap-1.5" aria-hidden="true">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-white drop-shadow">{movie.vote_average.toFixed(1)}</span>
            {year && <span className="text-xs text-white/80 drop-shadow">· {year}</span>}
          </div>
          <span className="sr-only">{movie.vote_average.toFixed(1)} de 10{year ? `, ${year}` : ''}</span>
        </div>

        <CardContent className="p-3 flex flex-col flex-1 gap-1.5">
          <p className="font-semibold text-sm leading-tight line-clamp-2">{movie.title}</p>
          <div className="mt-auto flex flex-wrap gap-1">
            {movieGenres.map((g) => (
              <Badge key={g.id} variant="secondary" className="text-xs px-1.5 py-0">
                {g.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function MovieCardSkeleton() {
  return (
    <Card className="overflow-hidden" aria-busy="true" aria-label="Carregando filme">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-20" />
      </CardContent>
    </Card>
  )
}
