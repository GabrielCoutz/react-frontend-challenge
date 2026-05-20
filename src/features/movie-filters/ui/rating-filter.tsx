import { useState, useEffect } from 'react'
import { Slider } from '@/shared/ui/slider'
import type { MovieFilters } from '../model/use-filter-bar'

interface RatingFilterProps {
  filters: MovieFilters
  onChange: (filters: MovieFilters) => void
  sidebar?: boolean
}

export function RatingFilter({ filters, onChange, sidebar = false }: RatingFilterProps) {
  const [ratingDisplay, setRatingDisplay] = useState(filters.minRating ?? 0)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setRatingDisplay(filters.minRating ?? 0) }, [filters.minRating])

  const handleCommit = (raw: number | readonly number[]) => {
    const v = Array.isArray(raw) ? raw[0] : raw
    const value = v ?? 0
    setRatingDisplay(value)
    onChange({ ...filters, minRating: value > 0 ? value : undefined })
  }

  return (
    <div className={sidebar ? 'space-y-2' : 'flex flex-col gap-1 min-w-40'}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Nota mínima</span>
        <span className="font-mono text-xs font-bold text-primary">
          {ratingDisplay > 0 ? `★ ${ratingDisplay}` : '—'}
        </span>
      </div>
      <Slider
        min={0} max={10} step={0.5}
        value={[ratingDisplay]}
        aria-label="Nota mínima"
        aria-valuetext={ratingDisplay > 0 ? `${ratingDisplay} de 10` : 'Sem filtro de nota'}
        onValueChange={(raw) => {
          const v = Array.isArray(raw) ? raw[0] : raw
          setRatingDisplay(v ?? 0)
        }}
        onValueCommitted={handleCommit}
        className="w-full"
      />
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>0</span><span>10</span>
      </div>
    </div>
  )
}
