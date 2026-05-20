export interface MovieFilters {
  genreIds: string[]
  year: number | undefined
  minRating: number | undefined
  certification: string | undefined
}

interface UseFilterBarProps {
  filters: MovieFilters
  onChange: (filters: MovieFilters) => void
  personId?: number
  onPersonChange?: (id: number | undefined, name: string | undefined) => void
  onClearQuery?: () => void
}

const EMPTY_FILTERS: MovieFilters = { genreIds: [], year: undefined, minRating: undefined, certification: undefined }

export function useFilterBar({ filters, onChange, personId, onPersonChange, onClearQuery }: UseFilterBarProps) {
  const hasActiveFilters =
    filters.genreIds.length > 0 ||
    !!filters.year ||
    !!filters.minRating ||
    !!filters.certification ||
    !!personId

  const handleClearAll = () => {
    onChange(EMPTY_FILTERS)
    onPersonChange?.(undefined, undefined)
    onClearQuery?.()
  }

  return { hasActiveFilters, handleClearAll }
}
