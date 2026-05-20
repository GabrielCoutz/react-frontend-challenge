import { X } from 'lucide-react'
import { useFilterBar } from '../model/use-filter-bar'
import type { MovieFilters } from '../model/use-filter-bar'
import { CastFilter } from './cast-filter'
import { GenreFilter } from './genre-filter'
import { YearFilter } from './year-filter'
import { CertificationFilter } from './certification-filter'
import { RatingFilter } from './rating-filter'

export type { MovieFilters }

interface FilterBarProps {
  onClearQuery?: () => void
  filters: MovieFilters
  onChange: (filters: MovieFilters) => void
  sidebar?: boolean
  personId?: number
  personName?: string
  onPersonChange?: (id: number | undefined, name: string | undefined) => void
}

export function FilterBar({ filters, onChange, sidebar = false, personId, personName, onPersonChange, onClearQuery }: FilterBarProps) {
  const { hasActiveFilters, handleClearAll } = useFilterBar({ filters, onChange, personId, onPersonChange, onClearQuery })

  return (
    <div className={sidebar ? 'flex flex-col gap-4' : 'flex flex-wrap items-end gap-4'}>
      {onPersonChange && (
        <CastFilter
          personId={personId}
          personName={personName}
          sidebar={sidebar}
          onPersonChange={onPersonChange}
        />
      )}

      <GenreFilter filters={filters} onChange={onChange} sidebar={sidebar} />
      <YearFilter filters={filters} onChange={onChange} sidebar={sidebar} />
      <CertificationFilter filters={filters} onChange={onChange} sidebar={sidebar} />
      <RatingFilter filters={filters} onChange={onChange} sidebar={sidebar} />

      {hasActiveFilters && (
        <button onClick={handleClearAll} className="flex min-h-11 sm:min-h-0 items-center gap-1.5 px-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
          <X className="h-3 w-3" aria-hidden="true" />
          Limpar filtros
        </button>
      )}
    </div>
  )
}
