import { useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/features/movie-search/ui/search-input";
import {
  FilterBar,
  type MovieFilters,
} from "@/features/movie-filters/ui/filter-bar";
import { MovieGrid } from "@/widgets/movie-grid/ui/movie-grid";
import { useTrending } from "@/entities/movie/api/use-trending";
import { useSearch as useMovieSearch } from "@/entities/movie/api/use-search";
import { useDiscover } from "@/entities/movie/api/use-discover";
import { useGenres } from "@/entities/movie/api/use-genres";

function hasFilters(f: MovieFilters) {
  return !!(f.genreIds.length || f.year || f.minRating);
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (n: number) => void;
}) {
  const capped = Math.min(totalPages, 500);
  return (
    <div className="flex items-center gap-2 ml-auto">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
        {page} / {capped}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPage(Math.min(capped, page + 1))}
        disabled={page >= capped}
        className="cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function DiscoveryPage() {
  const navigate = useNavigate({ from: "/discovery" });
  const {
    query = "",
    genreIds = [],
    year,
    minRating,
    page = 1,
  } = useSearch({
    from: "/_authenticated/discovery",
  });

  const { data: genres = [] } = useGenres();
  const filters: MovieFilters = { genreIds, year, minRating };
  const isSearching = query.trim().length > 0;
  const isFiltering = hasFilters(filters);

  const trending = useTrending(page);
  const searchResults = useMovieSearch(query, page);
  const discover = useDiscover({ page, genreIds, year, minRating });

  const active = isSearching
    ? searchResults
    : isFiltering
      ? discover
      : trending;
  const movies = active.data?.results ?? [];
  const totalPages = active.data?.total_pages ?? 1;

  const handleSearch = useCallback(
    (q: string) => {
      navigate({
        search: (prev) => ({ ...prev, query: q || undefined, page: 1 }),
      });
    },
    [navigate],
  );

  const handleFilters = useCallback(
    (f: MovieFilters) => {
      navigate({
        search: (prev) => ({
          ...prev,
          genreIds: f.genreIds.length ? f.genreIds : undefined,
          year: f.year,
          minRating: f.minRating,
          page: 1,
        }),
      });
    },
    [navigate],
  );

  const handlePage = (next: number) => {
    navigate({ search: (prev) => ({ ...prev, page: next }) });
  };

  const sectionTitle = isSearching
    ? `Resultados para "${query}"`
    : isFiltering
      ? "Filmes filtrados"
      : "Trending Esta Semana";

  return (
    <div className="flex">
      {/* Sidebar de filtros */}
      <aside className="w-52 shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4 space-y-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
          Filtros
        </p>
        <SearchInput onSearch={handleSearch} initialValue={query} />
        <FilterBar filters={filters} onChange={handleFilters} sidebar />
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 min-w-0 p-6 space-y-5">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-xl font-semibold">{sectionTitle}</h1>
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPage={handlePage}
            />
          )}
        </div>

        <MovieGrid
          movies={movies}
          genres={genres}
          isLoading={active.isLoading}
          isError={active.isError}
        />

        {totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPage={handlePage}
            />
          </div>
        )}
      </main>
    </div>
  );
}
