import { formatStamp, todayStamp } from '../lib/dates'

interface CompleteScreenProps {
  streak: number
  onHome: () => void
}

export function CompleteScreen({ streak, onHome }: CompleteScreenProps) {
  return (
    <div className="screen complete">
      <article className="complete-card">
        <p className="done-stamp" role="status">
          Done for today
        </p>
        <h2>That was enough.</h2>
        <p className="lede">
          Eight stretches, one quiet ten minutes. Stamped {formatStamp(todayStamp())}.
        </p>
        <p className="streak-line">
          Streak: <strong>{streak}</strong> {streak === 1 ? 'day' : 'days'}
        </p>
        <button className="primary" type="button" onClick={onHome}>
          Back home
        </button>
      </article>
    </div>
  )
}
