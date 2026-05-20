import { useState } from "react";
import { usePageTitle } from "@/shared/hooks/use-page-title";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet";
import { SearchInput } from "@/features/movie-search";
import { FilterBar, type MovieFilters } from "@/features/movie-filters";
import { MovieGrid } from "@/widgets/movie-grid";
import { useDiscoveryFilters } from "@/pages/discovery/model/use-discovery-filters";

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (n: number) => void }) {
  const capped = Math.min(totalPages, 500);
  return (
    <div className="flex items-center gap-2 ml-auto">
      <Button variant="outline" size="icon" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} className="cursor-pointer">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">{page} / {capped}</span>
      <Button variant="outline" size="icon" onClick={() => onPage(Math.min(capped, page + 1))} disabled={page >= capped} className="cursor-pointer">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface SidebarContentProps {
  query: string
  filters: MovieFilters
  personId?: number
  personName?: string
  onSearch: (q: string) => void
  onFilters: (f: MovieFilters) => void
  onPersonChange: (id: number | undefined, name: string | undefined) => void
}

function DiscoverySidebarContent({ query, filters, personId, personName, onSearch, onFilters, onPersonChange }: SidebarContentProps) {
  return (
    <div className="space-y-4">
      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Filtros</p>
      <SearchInput onSearch={onSearch} initialValue={query} key={query || 'empty'} />
      <FilterBar
        filters={filters}
        onChange={onFilters}
        sidebar
        personId={personId}
        personName={personName}
        onPersonChange={onPersonChange}
        onClearQuery={() => onSearch('')}
      />
    </div>
  )
}

export function DiscoveryPage() {
  usePageTitle('Descobrir Filmes')
  const [sheetOpen, setSheetOpen] = useState(false)

  const {
    query, filters, personId, personName, page,
    movies, totalPages, sectionTitle, activeFiltersCount,
    isLoading, isError,
    handleSearch, handleFilters, handlePersonChange,
    handlePage, handleRetry,
  } = useDiscoveryFilters()

  const sidebarProps: SidebarContentProps = {
    query, filters, personId, personName,
    onSearch: handleSearch,
    onFilters: handleFilters,
    onPersonChange: handlePersonChange,
  }

  return (
    <div className="flex">
      <aside className="hidden lg:block w-52 shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
        <DiscoverySidebarContent {...sidebarProps} />
      </aside>

      <main className="flex-1 min-w-0 p-4 lg:p-6 space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-semibold">{sectionTitle}</h1>

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
                <SheetTitle className="font-mono text-sm uppercase tracking-widest text-primary">CineDash</SheetTitle>
              </SheetHeader>
              <DiscoverySidebarContent {...sidebarProps} />
            </SheetContent>
          </Sheet>

          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPage={handlePage} />}
        </div>

        <MovieGrid movies={movies} isLoading={isLoading} isError={isError} onRetry={handleRetry} />

        {totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination page={page} totalPages={totalPages} onPage={handlePage} />
          </div>
        )}
      </main>
    </div>
  )
}
