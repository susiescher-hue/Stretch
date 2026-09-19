import { totalRoutineSeconds } from '../data/routine'
import { formatStamp } from '../lib/dates'
import { Disclaimer } from './Disclaimer'
import { RoutineList } from './RoutineList'

interface HomeScreenProps {
  streak: number
  lastCompleted: string | null
  doneToday: boolean
  muted: boolean
  onToggleMute: () => void
  onStart: () => void
  onMarkComplete: () => void
}

export function HomeScreen({
  streak,
  lastCompleted,
  doneToday,
  muted,
  onToggleMute,
  onStart,
  onMarkComplete,
}: HomeScreenProps) {
  const minutes = Math.round(totalRoutineSeconds() / 60)

  return (
    <div className="screen home">
      <header className="top">
        <p className="brand-kicker">For Susie · every day</p>
        <h1>Stretch</h1>
        <p className="lede">
          The same {minutes}-minute routine. Built-in timer. No extra clock.
          No login.
        </p>
      </header>

      <section className="hero-card" aria-live="polite">
        <div className="hero-stats">
          <div>
            <span className="stat-label">Streak</span>
            <strong>{streak}</strong>
            <em>{streak === 1 ? 'day' : 'days'}</em>
          </div>
          <div>
            <span className="stat-label">Last done</span>
            <strong className="stat-date">{formatStamp(lastCompleted)}</strong>
          </div>
        </div>
        {doneToday && (
          <p className="done-stamp" role="status">
            Done for today
          </p>
        )}
      </section>

      <div className="home-actions">
        <button className="primary" type="button" onClick={onStart}>
          {doneToday ? 'Do it again' : 'Start session'}
        </button>
        <div className="home-row">
          <button className="ghost" type="button" onClick={onToggleMute}>
            {muted ? 'Chime off' : 'Chime on'}
          </button>
          <button
            className="ghost"
            type="button"
            onClick={onMarkComplete}
            disabled={doneToday}
          >
            {doneToday ? 'Marked' : 'Mark day complete'}
          </button>
        </div>
      </div>

      <Disclaimer />

      <section>
        <h2 className="section-title">Today’s eight</h2>
        <RoutineList />
      </section>
    </div>
  )
}
