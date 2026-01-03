import { useEffect } from 'react'

/**
 * Hook to set the browser tab title for client components
 * @param title - The page title (will be suffixed with "| Nality")
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title ? `${title} | Nality` : 'Nality'
    
    return () => {
      document.title = previousTitle
    }
  }, [title])
}
