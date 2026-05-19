import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — CineDash` : 'CineDash'
    return () => {
      document.title = 'CineDash'
    }
  }, [title])
}
