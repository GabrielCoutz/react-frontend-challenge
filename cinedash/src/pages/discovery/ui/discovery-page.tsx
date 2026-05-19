import { useCallback, useState } from "react";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchInput } from "@/features/movie-search/ui/search-input";
import {
  FilterBar,
  type MovieFilters,
} from "@/features/movie-filters/ui/filter-bar";
import { MovieGrid } from "@/widgets/movie-grid/ui/movie-grid";
import { useTrending } from "@/entities/movie/api/use-trending";
import { useSearch as useMovieSearch } from "@/entities/movie/api/use-search";
import { useDiscover } from "@/entities/movie/api/use-discover";

import { Button } from "@/components/ui/button";

function hasFilters(f: MovieFilters) {
  return !!(f.genreIds.length || f.year || f.minRating || f.certification);
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

function FilterSidebarContent({
  filters,
  query,
  personId,
  personName,
  onSearch,
  onFilters,
  onPersonChange,
}: {
  filters: MovieFilters;
  query: string;
  personId?: number;
  personName?: string;
  onSearch: (q: string) => void;
  onFilters: (f: MovieFilters) => void;
  onPersonChange: (id: number | undefined, name: string | undefined) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
        Filtros
      </p>
      <SearchInput onSearch={onSearch} initialValue={query} />
      <FilterBar
        filters={filters}
        onChange={onFilters}
        sidebar
        personId={personId}
        personName={personName}
        onPersonChange={onPersonChange}
      />
    </div>
  );
}

export function DiscoveryPage() {
  usePageTitle('Descobrir Filmes')
  const navigate = useNavigate({ from: "/discovery" });
  const [sheetOpen, setSheetOpen] = useState(false);
  const {
    query = "",
    genreIds = [],
    year,
    minRating,
    certification,
    personId,
    personName,
    page = 1,
  } = useSearch({
    from: "/_authenticated/discovery",
  });

  const filters: MovieFilters = { genreIds, year, minRating, certification };
  const isSearching = query.trim().length > 0;
  const isFiltering = hasFilters(filters) || !!personId;
  const activeFiltersCount =
    genreIds.length +
    (year ? 1 : 0) +
    (minRating ? 1 : 0) +
    (certification ? 1 : 0) +
    (personId ? 1 : 0) +
    (query ? 1 : 0);

  const trending = useTrending(page);
  const searchResults = useMovieSearch(query, page);
  const discover = useDiscover({ page, genreIds, year, minRating, certification, personId });

  const active = isSearching
    ? searchResults
    : isFiltering
      ? discover
      : trending;
  const movies = active.data?.results ?? [];
  const totalPages = active.data?.total_pages ?? 1;
  const handleRetry = () => { void active.refetch() }

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
          certification: f.certification,
          page: 1,
        }),
      });
    },
    [navigate],
  );

  const handlePersonChange = (
    id: number | undefined,
    name: string | undefined,
  ) => {
    navigate({
      search: (prev) => ({ ...prev, personId: id, personName: name, page: 1 }),
    });
  };

  const handlePage = (next: number) => {
    navigate({ search: (prev) => ({ ...prev, page: next }) });
  };

  const sectionTitle = isSearching
    ? `Resultados para "${query}"`
    : personId
      ? `Filmes com ${personName ?? "..."}`
      : isFiltering
        ? "Filmes filtrados"
        : "Trending Esta Semana";

  const sidebarContent = (
    <FilterSidebarContent
      filters={filters}
      query={query}
      personId={personId}
      personName={personName}
      onSearch={handleSearch}
      onFilters={handleFilters}
      onPersonChange={handlePersonChange}
    />
  );

  return (
    <div className="flex">
      {/* Sidebar — visível apenas em lg+ */}
      <aside className="hidden lg:block w-52 shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
        {sidebarContent}
      </aside>

      <main className="flex-1 min-w-0 p-4 lg:p-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-semibold">{sectionTitle}</h1>

          {/* Botão de filtros — visível apenas em mobile */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger className="lg:hidden inline-flex items-center gap-2 rounded-lg border border-border px-3 h-8 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto p-6">
              <SheetHeader className="mb-4">
                <SheetTitle className="font-mono text-sm uppercase tracking-widest text-primary">
                  CineDash
                </SheetTitle>
              </SheetHeader>
              {sidebarContent}
            </SheetContent>
          </Sheet>

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

          isLoading={active.isLoading}
          isError={active.isError}
          onRetry={handleRetry}
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
