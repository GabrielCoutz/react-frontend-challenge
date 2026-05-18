import { useParams, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ArrowLeft, Star, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMovie } from '@/entities/movie/api/use-movie'
import { useCredits } from '@/entities/movie/api/use-credits'
import { useVideos } from '@/entities/movie/api/use-videos'
import { useWatchlistStore } from '@/features/watchlist/model/watchlist-store'
import { getImageUrl } from '@/shared/api/tmdb-client'

export function MovieDetailsPage() {
  const { id } = useParams({ from: '/_authenticated/movie/$id' })
  const movieId = Number(id)
  const navigate = useNavigate()

  const { data: movie, isLoading: loadingMovie } = useMovie(movieId)
  const { data: credits, isLoading: loadingCredits } = useCredits(movieId)
  const { data: trailers = [], isLoading: loadingVideos } = useVideos(movieId)

  const { add, remove, isInWatchlist } = useWatchlistStore()
  const inWatchlist = movie ? isInWatchlist(movie.id) : false

  const handleWatchlistToggle = () => {
    if (!movie) return
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

  const isLoading = loadingMovie || loadingCredits || loadingVideos
  const topCast = credits?.cast.slice(0, 5) ?? []
  const trailer = trailers[0]
  const posterUrl = getImageUrl(movie?.poster_path ?? null, 'w500')
  const backdropUrl = getImageUrl(movie?.backdrop_path ?? null, 'original')

  if (isLoading) return <MovieDetailsSkeleton />

  if (!movie) return (
    <div className="container mx-auto p-6 text-center text-muted-foreground py-20">
      Filme não encontrado.
    </div>
  )

  return (
    <div>
      {backdropUrl && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={backdropUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      <div className="container mx-auto p-6 space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/discovery' })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>

        <div className="flex flex-col md:flex-row gap-8">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-48 rounded-lg shadow-lg shrink-0 self-start"
            />
          )}

          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {movie.vote_average.toFixed(1)}
                </span>
                {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
              </div>
              {movie.genres && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <Badge key={g.id} variant="secondary">{g.name}</Badge>
                  ))}
                </div>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>

            <Button onClick={handleWatchlistToggle} variant={inWatchlist ? 'secondary' : 'default'}>
              {inWatchlist ? (
                <><Check className="h-4 w-4 mr-2" /> Na lista</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" /> Adicionar à lista</>
              )}
            </Button>
          </div>
        </div>

        {topCast.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Elenco</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {topCast.map((actor) => {
                const photo = getImageUrl(actor.profile_path, 'w185')
                return (
                  <div key={actor.id} className="shrink-0 w-24 text-center space-y-1">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mx-auto">
                      {photo ? (
                        <img src={photo} alt={actor.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          Sem foto
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium line-clamp-2">{actor.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{actor.character}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {trailer && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Trailer</h2>
            <div className="aspect-video w-full max-w-2xl rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function MovieDetailsSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-8 w-24" />
      <div className="flex gap-8">
        <Skeleton className="w-48 h-72 rounded-lg shrink-0" />
        <div className="space-y-3 flex-1">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  )
}
