import { useEffect, useRef, useState } from 'react'

const AUTO_DISMISS_MS = 5000

interface Props {
  onDismiss: () => void
}

export default function ConnectionPopup({ onDismiss }: Props): JSX.Element {
  const [exiting, setExiting] = useState(false)
  const dismissedRef = useRef(false)

  function dismiss() {
    if (dismissedRef.current) return
    dismissedRef.current = true
    setExiting(true)
    setTimeout(onDismiss, 200)
  }

  useEffect(() => {
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS)
    const onKey = () => dismiss()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={dismiss}
    >
      <div
        className={`connection-popup ${exiting ? 'connection-popup-exit' : 'connection-popup-enter'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-3 select-none">😄</div>
        <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Ready to Fry-Q!</h2>
        <p className="text-amber-100/80 text-sm font-medium">Sensor connected and online</p>
      </div>
    </div>
  )
}
