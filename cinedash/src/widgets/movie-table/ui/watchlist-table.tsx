import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useGenres } from "@/entities/movie/api/use-genres";
import type { WatchlistMovie } from "@/features/watchlist/model/watchlist-store";

interface WatchlistTableProps {
  movies: WatchlistMovie[];
  onRemove: (movieId: number) => void;
}

const columnHelper = createColumnHelper<WatchlistMovie>();

const RATINGS = ["all", "6", "7", "7.5", "8", "8.5", "9"];

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
  if (sorted === "asc") return <ArrowUp className="ml-1 h-3 w-3" />;
  return <ArrowDown className="ml-1 h-3 w-3" />;
}

export function WatchlistTable({ movies, onRemove }: WatchlistTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { data: genres = [] } = useGenres();

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: ({ column }) => (
          <button
            className="flex items-center font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Título
            <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => (
          <Link
            to="/movie/$id"
            params={{ id: String(row.original.id) }}
            className="font-medium hover:underline line-clamp-1"
          >
            {row.original.title}
          </Link>
        ),
        filterFn: "includesString",
      }),

      columnHelper.accessor((row) => row.genre_ids?.[0] ?? 0, {
        id: "genre",
        header: ({ column }) => (
          <button
            className="flex items-center font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Gênero
            <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => {
          const name =
            genres.find((g) => g.id === (row.original.genre_ids?.[0] ?? 0))
              ?.name ?? "—";
          return <Badge variant="secondary">{name}</Badge>;
        },
        sortingFn: (a, b) => {
          const nameA =
            genres.find((g) => g.id === (a.original.genre_ids?.[0] ?? 0))
              ?.name ?? "";
          const nameB =
            genres.find((g) => g.id === (b.original.genre_ids?.[0] ?? 0))
              ?.name ?? "";
          return nameA.localeCompare(nameB);
        },
      }),

      columnHelper.accessor("release_date", {
        header: "Data",
        cell: ({ getValue }) => getValue()?.slice(0, 4) ?? "—",
      }),

      columnHelper.accessor("vote_average", {
        header: ({ column }) => (
          <button
            className="flex items-center font-medium"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rating
            <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium">★ {getValue().toFixed(1)}</span>
        ),
        filterFn: (row, _columnId, filterValue: string) => {
          if (!filterValue || filterValue === "all") return true;
          return row.original.vote_average >= Number(filterValue);
        },
      }),

      columnHelper.display({
        id: "actions",
        header: "Ações",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onRemove(row.original.id)}
            aria-label="Remover da lista"
          >
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
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por título..."
          className="w-56"
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("title")?.setFilterValue(e.target.value)
          }
        />
        <Select
          value={
            (table.getColumn("vote_average")?.getFilterValue() as string) ??
            "all"
          }
          onValueChange={(v) =>
            table
              .getColumn("vote_average")
              ?.setFilterValue(v === "all" ? "" : v)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Nota mínima" />
          </SelectTrigger>
          <SelectContent>
            {RATINGS.map((r) => (
              <SelectItem key={r} value={r}>
                {r === "all" ? "Qualquer nota" : `★ ${r}+`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  Nenhum filme na lista
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {table.getFilteredRowModel().rows.length} de {movies.length} filmes
      </p>
    </div>
  );
}
