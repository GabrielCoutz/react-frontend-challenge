import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGenres } from '@/entities/movie/api/use-genres'

export interface MovieFilters {
  genreId: string
  year: number | undefined
  minRating: number | undefined
}

interface FilterBarProps {
  filters: MovieFilters
  onChange: (filters: MovieFilters) => void
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i)
const RATINGS = [6, 7, 7.5, 8, 8.5, 9]

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const { data: genres = [] } = useGenres()

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={filters.genreId}
        onValueChange={(v) => onChange({ ...filters, genreId: v === 'all' ? '' : v })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Gênero" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os gêneros</SelectItem>
          {genres.map((g) => (
            <SelectItem key={g.id} value={String(g.id)}>
              {g.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.year ? String(filters.year) : 'all'}
        onValueChange={(v) => onChange({ ...filters, year: v === 'all' ? undefined : Number(v) })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Qualquer ano</SelectItem>
          {YEARS.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.minRating ? String(filters.minRating) : 'all'}
        onValueChange={(v) =>
          onChange({ ...filters, minRating: v === 'all' ? undefined : Number(v) })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Nota mínima" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Qualquer nota</SelectItem>
          {RATINGS.map((r) => (
            <SelectItem key={r} value={String(r)}>
              ★ {r}+
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
