import { useEffect } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Star, Plus, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMovie } from "@/entities/movie/api/use-movie";
import { useCredits } from "@/entities/movie/api/use-credits";
import { useVideos } from "@/entities/movie/api/use-videos";
import { useWatchlistStore } from "@/features/watchlist/model/watchlist-store";
import { getImageUrl } from "@/shared/api/tmdb-client";
import { Image } from "@/shared/ui/image";

export function MovieDetailsPage() {
  const { id } = useParams({ from: "/_authenticated/movie/$id" });
  const movieId = Number(id);

  const { data: movie, isLoading: loadingMovie, isError: errorMovie } = useMovie(movieId);
  const { data: credits, isLoading: loadingCredits, isError: errorCredits, refetch: refetchCredits } = useCredits(movieId);
  const { data: trailers = [], isLoading: loadingVideos, isError: errorVideos, refetch: refetchVideos } = useVideos(movieId);

  const { add, remove, isInWatchlist } = useWatchlistStore();
  const inWatchlist = movie ? isInWatchlist(movie.id) : false;

  const isLoading = loadingMovie;

  const certification = movie?.release_dates?.results
    ?.find((r) => r.iso_3166_1 === 'BR')
    ?.release_dates?.find((d) => d.certification)
    ?.certification

  useEffect(() => {
    document.title = movie ? `${movie.title} — CineDash` : 'CineDash'
    return () => { document.title = 'CineDash' }
  }, [movie?.title])

  const topCast = credits?.cast.slice(0, 5) ?? [];
  const trailer = trailers[0];
  const posterUrl = getImageUrl(movie?.poster_path ?? null, "w500");
  const backdropUrl = getImageUrl(movie?.backdrop_path ?? null, "original");

  const handleWatchlistToggle = () => {
    if (!movie) return;
    if (inWatchlist) {
      remove(movie.id);
      toast.success(`"${movie.title}" removido da lista`);
    } else {
      add({
        id: movie.id,
        title: movie.title,
        genre_ids: movie.genre_ids?.length
          ? movie.genre_ids
          : (movie.genres?.map((g) => g.id) ?? []),
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        certification,
      });
      toast.success(`"${movie.title}" adicionado à lista`);
    }
  };

  if (isLoading) return <MovieDetailsSkeleton />;

  if (errorMovie)
    return (
      <div className="container mx-auto p-6 py-20 flex flex-col items-center gap-3 text-muted-foreground">
        <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
        <p className="text-lg font-medium text-foreground">Falha ao carregar o filme</p>
        <p className="text-sm">Verifique sua conexão e tente novamente</p>
        <button
          onClick={() => window.history.back()}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Voltar
        </button>
      </div>
    );

  if (!movie)
    return (
      <div className="container mx-auto p-6 text-center text-muted-foreground py-20">
        Filme não encontrado.
      </div>
    );

  return (
    <div>
      {/* Backdrop */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden bg-muted">
        <Image src={backdropUrl} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 sm:space-y-8">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" /> Voltar
        </Button>

        {/* Poster + Info */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          <div className="relative w-32 sm:w-48 shrink-0 self-start rounded-lg overflow-hidden shadow-lg aspect-[2/3]">
            <Image src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-4 flex-1 min-w-0">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  {movie.vote_average.toFixed(1)}
                </span>
                {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
                {certification && (
                  <span className="font-mono text-xs font-bold border border-border rounded px-1.5 py-0.5">
                    {certification}
                  </span>
                )}
              </div>
              {movie.genres && (
                <ul className="flex flex-wrap gap-2" aria-label="Gêneros">
                  {movie.genres.map((g) => (
                    <li key={g.id}>
                      <Link to="/discovery" search={{ genreIds: [String(g.id)], page: 1 }} aria-label={`Filtrar por gênero: ${g.name}`}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                          {g.name}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {movie.overview}
            </p>

            <Button
              onClick={handleWatchlistToggle}
              variant={inWatchlist ? "secondary" : "default"}
              aria-pressed={inWatchlist}
              aria-label={inWatchlist ? `Remover ${movie.title} da watchlist` : `Adicionar ${movie.title} à watchlist`}
            >
              {inWatchlist ? (
                <><Check className="h-4 w-4 mr-2" aria-hidden="true" /> Na lista</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" aria-hidden="true" /> Adicionar à lista</>
              )}
            </Button>
          </div>
        </div>

        {/* Elenco */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold">Elenco</h2>
          {errorCredits ? (
            <div role="alert" className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
              <span className="text-muted-foreground">Falha ao carregar o elenco.</span>
              <button onClick={() => refetchCredits()} className="ml-auto text-primary hover:underline shrink-0">
                Tentar novamente
              </button>
            </div>
          ) : loadingCredits ? (
            <div className="flex gap-3 sm:gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 w-20 sm:w-24 space-y-2 text-center">
                  <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          ) : topCast.length > 0 ? (
            <ul className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 pl-1 pt-1" aria-label="Elenco principal">
              {topCast.map((actor) => {
                const photo = getImageUrl(actor.profile_path, "w185");
                return (
                  <li key={actor.id} className="shrink-0">
                    <Link
                      to="/discovery"
                      search={{ personId: actor.id, personName: actor.name, page: 1 }}
                      className="flex flex-col w-20 sm:w-24 text-center space-y-1 group/actor"
                      aria-label={`Ver filmes de ${actor.name}`}
                    >
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover/actor:ring-primary transition-all z-10 pointer-events-none" />
                        <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                          <Image src={photo} alt={actor.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <p className="text-xs font-medium line-clamp-2 group-hover/actor:text-primary transition-colors">
                        {actor.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {actor.character}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>

        {/* Trailer */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold">Trailer</h2>
          {errorVideos ? (
            <div role="alert" className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
              <span className="text-muted-foreground">Falha ao carregar o trailer.</span>
              <button onClick={() => refetchVideos()} className="ml-auto text-primary hover:underline shrink-0">
                Tentar novamente
              </button>
            </div>
          ) : loadingVideos ? (
            <Skeleton className="aspect-video w-full rounded-lg" />
          ) : trailer ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum trailer disponível.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function MovieDetailsSkeleton() {
  return (
    <div>
      {/* Backdrop skeleton */}
      <Skeleton className="h-48 sm:h-64 md:h-80 w-full rounded-none" />

      <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 sm:space-y-8">
        <Skeleton className="h-8 w-20" />

        {/* Poster + info skeleton */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          <Skeleton className="w-32 sm:w-48 aspect-[2/3] rounded-lg shrink-0" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-20 sm:h-24 w-full" />
            <Skeleton className="h-9 w-40" />
          </div>
        </div>

        {/* Elenco skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-3 sm:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shrink-0 w-20 sm:w-24 space-y-2 text-center">
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
