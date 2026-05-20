import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface SortIconProps {
  sorted: false | 'asc' | 'desc'
}

export function SortIcon({ sorted }: SortIconProps) {
  if (!sorted) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
  if (sorted === 'asc') return <ArrowUp className="ml-1 h-3 w-3" />
  return <ArrowDown className="ml-1 h-3 w-3" />
}
