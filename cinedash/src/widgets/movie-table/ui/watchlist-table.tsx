import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGenres } from "@/entities/movie/api/use-genres";
import type { WatchlistMovie } from "@/features/watchlist/model/watchlist-store";

interface WatchlistTableProps {
  movies: WatchlistMovie[];
  onRemove: (movieId: number) => void;
}

const columnHelper = createColumnHelper<WatchlistMovie>();

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
  if (sorted === "asc") return <ArrowUp className="ml-1 h-3 w-3" />;
  return <ArrowDown className="ml-1 h-3 w-3" />;
}

export function WatchlistTable({ movies, onRemove }: WatchlistTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data: genres = [] } = useGenres();

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: ({ column }) => (
          <button className="flex items-center font-medium" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Título <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => (
          <Link to="/movie/$id" params={{ id: String(row.original.id) }} className="font-medium hover:underline line-clamp-1">
            {row.original.title}
          </Link>
        ),
      }),

      columnHelper.accessor((row) => row.genre_ids?.[0] ?? 0, {
        id: "genre",
        header: ({ column }) => (
          <button className="flex items-center font-medium" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Gênero <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => {
          const name = genres.find((g) => g.id === (row.original.genre_ids?.[0] ?? 0))?.name ?? "—";
          return <Badge variant="secondary">{name}</Badge>;
        },
        sortingFn: (a, b) => {
          const nameA = genres.find((g) => g.id === (a.original.genre_ids?.[0] ?? 0))?.name ?? "";
          const nameB = genres.find((g) => g.id === (b.original.genre_ids?.[0] ?? 0))?.name ?? "";
          return nameA.localeCompare(nameB);
        },
      }),

      columnHelper.accessor("release_date", {
        header: "Data",
        cell: ({ getValue }) => getValue()?.slice(0, 4) ?? "—",
      }),

      columnHelper.accessor("vote_average", {
        header: ({ column }) => (
          <button className="flex items-center font-medium" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Rating <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ getValue }) => <span className="font-medium">★ {getValue().toFixed(1)}</span>,
      }),

      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: ({ row }) => (
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onRemove(row.original.id)} aria-label="Remover da lista">
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      }),
    ],
    [genres, onRemove],
  );

  const table = useReactTable({
    data: movies,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <div className="rounded-md border px-4 py-12 text-center text-muted-foreground text-sm">
        Nenhum filme na lista
      </div>
    )
  }

  return (
    <>
      {/* Mobile — layout em cards */}
      <div className="sm:hidden space-y-3">
        {rows.map((row) => {
          const movie = row.original
          const genreName = genres.find((g) => g.id === (movie.genre_ids?.[0] ?? 0))?.name ?? "—"
          return (
            <div key={row.id} className="rounded-md border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Link
                  to="/movie/$id"
                  params={{ id: String(movie.id) }}
                  className="font-semibold text-sm hover:underline leading-tight"
                >
                  {movie.title}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive shrink-0 -mt-1 -mr-2"
                  onClick={() => onRemove(movie.id)}
                  aria-label="Remover da lista"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="space-y-0.5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Gênero</p>
                  <Badge variant="secondary" className="text-xs">{genreName}</Badge>
                </div>
                <div className="space-y-0.5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Ano</p>
                  <p className="text-sm">{movie.release_date?.slice(0, 4) ?? "—"}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Rating</p>
                  <p className="text-sm font-medium">★ {movie.vote_average.toFixed(1)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop — tabela com colunas */}
      <div className="hidden sm:block overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
