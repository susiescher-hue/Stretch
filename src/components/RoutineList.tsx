import { ROUTINE, formatClock } from '../data/routine'

interface RoutineListProps {
  compact?: boolean
}

export function RoutineList({ compact = false }: RoutineListProps) {
  return (
    <ol className={`routine ${compact ? 'is-compact' : ''}`}>
      {ROUTINE.map((stretch) => (
        <li key={stretch.id}>
          <div className="routine-top">
            <span className="routine-num">{stretch.number}</span>
            <div>
              <strong>{stretch.name}</strong>
              <em>
                {stretch.bilateral
                  ? `${stretch.seconds}s each side`
                  : formatClock(stretch.seconds * 1000)}
                {' · '}
                {stretch.purpose}
              </em>
            </div>
          </div>
          {!compact && (
            <>
              <p className="routine-cue">{stretch.cue}</p>
              <div className="demo-row">
                <a
                  className="demo-link"
                  href={stretch.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Watch demo
                </a>
                {stretch.extraDemo && (
                  <a
                    className="demo-link is-soft"
                    href={stretch.extraDemo.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {stretch.extraDemo.label}
                  </a>
                )}
              </div>
            </>
          )}
        </li>
      ))}
    </ol>
  )
}
