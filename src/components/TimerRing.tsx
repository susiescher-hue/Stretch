import { formatClock } from '../data/routine'

interface TimerRingProps {
  remainingMs: number
  durationMs: number
  pulse?: boolean
  label?: string
}

export function TimerRing({
  remainingMs,
  durationMs,
  pulse = false,
  label = 'Time left',
}: TimerRingProps) {
  const radius = 104
  const circumference = 2 * Math.PI * radius
  const progress = durationMs === 0 ? 0 : Math.min(1, Math.max(0, remainingMs / durationMs))
  const offset = circumference * (1 - progress)
  const urgent = remainingMs > 0 && remainingMs <= 5000

  return (
    <div className={`timer-ring ${pulse ? 'is-pulse' : ''} ${urgent ? 'is-urgent' : ''}`}>
      <svg viewBox="0 0 240 240" aria-hidden="true">
        <defs>
          <linearGradient id="stretch-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b8f78" />
            <stop offset="100%" stopColor="#c4a36a" />
          </linearGradient>
        </defs>
        <circle className="ring-track" cx="120" cy="120" r={radius} />
        <circle
          className="ring-value"
          cx="120"
          cy="120"
          r={radius}
          stroke="url(#stretch-ring)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="timer-face">
        <p className="timer-kicker">{label}</p>
        <p className="timer-digits" aria-live="polite">
          {formatClock(remainingMs)}
        </p>
      </div>
    </div>
  )
}
