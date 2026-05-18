import { useWatchlistStore } from "@/features/watchlist/model/watchlist-store";
import { WatchlistTable } from "@/widgets/movie-table/ui/watchlist-table";

export function WatchlistPage() {
  const { movies, remove } = useWatchlistStore();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Minha Lista</h1>
      <WatchlistTable movies={movies} onRemove={remove} />
    </div>
  );
}
