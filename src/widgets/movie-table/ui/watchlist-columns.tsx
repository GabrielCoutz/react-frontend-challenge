import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/shared/ui/badge'
import type { Genre } from '@/shared/api/tmdb.types'
import type { WatchlistMovie } from '@/features/watchlist'
import { RemoveButton } from './remove-button'
import { SortIcon } from './sort-icon'

const columnHelper = createColumnHelper<WatchlistMovie>()

export function useWatchlistColumns(genres: Genre[], onRemove: (id: number) => void) {
  return useMemo(
    () => [
      columnHelper.accessor('title', {
        header: ({ column }) => (
          <button className="flex items-center font-medium" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Título <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => (
          <Link to="/movie/$id" params={{ id: String(row.original.id) }} title={row.original.title} className="font-medium hover:underline line-clamp-1">
            {row.original.title}
          </Link>
        ),
      }),

      columnHelper.accessor((row) => row.genre_ids?.[0] ?? 0, {
        id: 'genre',
        header: ({ column }) => (
          <button className="flex items-center font-medium" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Gênero <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ row }) => {
          const name = genres.find((g) => g.id === (row.original.genre_ids?.[0] ?? 0))?.name ?? '—'
          return <Badge variant="secondary">{name}</Badge>
        },
        sortingFn: (a, b) => {
          const nameA = genres.find((g) => g.id === (a.original.genre_ids?.[0] ?? 0))?.name ?? ''
          const nameB = genres.find((g) => g.id === (b.original.genre_ids?.[0] ?? 0))?.name ?? ''
          return nameA.localeCompare(nameB)
        },
      }),

      columnHelper.accessor('release_date', {
        header: ({ column }) => (
          <button className="flex items-center font-medium" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Lançamento <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ getValue }) => {
          const val = getValue()
          if (!val) return '—'
          return new Date(val + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        },
      }),

      columnHelper.accessor('certification', {
        header: ({ column }) => (
          <button className="flex items-center font-medium" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Faixa <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ getValue }) => {
          const cert = getValue()
          return cert
            ? <span className="font-mono text-xs font-bold border border-border rounded px-1.5 py-0.5">{cert}</span>
            : <span className="text-muted-foreground">—</span>
        },
        sortingFn: (a, b) => {
          const order = ['L', '10', '12', '14', '16', '18']
          const ia = order.indexOf(a.original.certification ?? '')
          const ib = order.indexOf(b.original.certification ?? '')
          const wa = ia === -1 ? order.length : ia
          const wb = ib === -1 ? order.length : ib
          return wa - wb
        },
      }),

      columnHelper.accessor('vote_average', {
        header: ({ column }) => (
          <button className="flex items-center font-medium" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Rating <SortIcon sorted={column.getIsSorted()} />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium">
            <span aria-hidden="true">★ </span>
            <span className="sr-only">Avaliação: </span>
            {getValue().toFixed(1)}
          </span>
        ),
      }),

      columnHelper.display({
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          <RemoveButton title={row.original.title} onConfirm={() => onRemove(row.original.id)} />
        ),
      }),
    ],
    [genres, onRemove],
  )
}
