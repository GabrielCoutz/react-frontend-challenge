import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState } from '@tanstack/react-table'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/shared/ui/badge'
import { useGenres } from '@/entities/movie'
import type { WatchlistMovie } from '@/features/watchlist'
import { RemoveButton } from './remove-button'
import { useWatchlistColumns } from './watchlist-columns'

interface WatchlistTableProps {
  movies: WatchlistMovie[]
  onRemove: (movieId: number) => void
}

export function WatchlistTable({ movies, onRemove }: WatchlistTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const { data: genres = [] } = useGenres()

  const columns = useWatchlistColumns(genres, onRemove)

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: movies,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const rows = table.getRowModel().rows

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
      <ul className="sm:hidden space-y-3" aria-label="Watchlist de filmes">
        {rows.map((row) => {
          const movie = row.original
          const genreName = genres.find((g) => g.id === (movie.genre_ids?.[0] ?? 0))?.name ?? '—'
          return (
            <li key={row.id} className="rounded-md border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Link
                  to="/movie/$id"
                  params={{ id: String(movie.id) }}
                  className="font-semibold text-sm hover:underline leading-tight"
                >
                  {movie.title}
                </Link>
                <div className="shrink-0 -mt-1 -mr-2">
                  <RemoveButton title={movie.title} onConfirm={() => onRemove(movie.id)} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="space-y-0.5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Gênero</p>
                  <Badge variant="secondary" className="text-xs">{genreName}</Badge>
                </div>
                <div className="space-y-0.5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Lançamento</p>
                  <p className="text-sm">
                    {movie.release_date
                      ? new Date(movie.release_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Faixa</p>
                  {movie.certification
                    ? <span className="font-mono text-xs font-bold border border-border rounded px-1 py-0.5">{movie.certification}</span>
                    : <span className="text-sm text-muted-foreground">—</span>}
                </div>
                <div className="space-y-0.5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Rating</p>
                  <p className="text-sm font-medium">
                    <span aria-hidden="true">★ </span>
                    <span className="sr-only">Avaliação: </span>
                    {movie.vote_average.toFixed(1)}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Desktop — tabela com colunas */}
      <div className="hidden sm:block overflow-x-auto rounded-md border">
        <table className="w-full text-sm" aria-label="Watchlist de filmes">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                    aria-sort={
                      header.column.getIsSorted() === 'asc' ? 'ascending'
                      : header.column.getIsSorted() === 'desc' ? 'descending'
                      : header.column.getCanSort() ? 'none' : undefined
                    }
                  >
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
  )
}
