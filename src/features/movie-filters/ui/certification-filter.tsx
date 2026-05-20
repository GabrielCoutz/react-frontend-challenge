import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { useCertifications } from '@/entities/movie'
import type { MovieFilters } from '../model/use-filter-bar'

interface CertificationFilterProps {
  filters: MovieFilters
  onChange: (filters: MovieFilters) => void
  sidebar?: boolean
}

export function CertificationFilter({ filters, onChange, sidebar = false }: CertificationFilterProps) {
  const [open, setOpen] = useState(false)
  const { data: certifications = [] } = useCertifications(open)

  return (
    <Select
      key={`cert-${filters.certification ?? 'none'}`}
      open={open}
      onOpenChange={setOpen}
      value={filters.certification ?? undefined}
      onValueChange={(v) => onChange({ ...filters, certification: v === 'all' || !v ? undefined : v })}
    >
      <SelectTrigger className={sidebar ? 'w-full' : 'w-40'}>
        <SelectValue placeholder="Classificação">
          {filters.certification ?? undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Qualquer classificação</SelectItem>
        {certifications.map((c) => (
          <SelectItem key={c.certification} value={c.certification}>
            {c.certification}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
