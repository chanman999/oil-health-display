import { useEffect, useState } from 'react'

function currentHHMM(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function Clock() {
  const [time, setTime] = useState(currentHHMM)

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>
    const now = new Date()
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

    const timeoutId = setTimeout(() => {
      setTime(currentHHMM())
      intervalId = setInterval(() => setTime(currentHHMM()), 60_000)
    }, msUntilNextMinute)

    return () => { clearTimeout(timeoutId); clearInterval(intervalId) }
  }, [])

  return (
    <span className="text-slate-100 font-bold tabular-nums" style={{ fontSize: '2rem', lineHeight: 1 }}>
      {time}
    </span>
  )
}
