import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import type { MovieFilters } from '../model/use-filter-bar'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i)

interface YearFilterProps {
  filters: MovieFilters
  onChange: (filters: MovieFilters) => void
  sidebar?: boolean
}

export function YearFilter({ filters, onChange, sidebar = false }: YearFilterProps) {
  return (
    <Select
      key={`year-${filters.year ?? 'none'}`}
      value={filters.year ? String(filters.year) : undefined}
      onValueChange={(v) => onChange({ ...filters, year: v === 'clear' || !v ? undefined : Number(v) })}
    >
      <SelectTrigger className={sidebar ? 'w-full' : 'w-36'}>
        <SelectValue placeholder="Ano" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="clear">Qualquer ano</SelectItem>
        {YEARS.map((y) => (
          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
