import { useEffect, useState } from 'react'

export function useOperatorPanel() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.shiftKey && e.code === 'KeyO') {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { open, setOpen }
}
