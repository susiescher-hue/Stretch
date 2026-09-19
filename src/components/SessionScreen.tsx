import { ROUTINE, sideLabel } from '../data/routine'
import type { useSession } from '../hooks/useSession'
import { TimerRing } from './TimerRing'

type Session = ReturnType<typeof useSession>

interface SessionScreenProps {
  session: Session
  muted: boolean
  onToggleMute: () => void
}

export function SessionScreen({ session, muted, onToggleMute }: SessionScreenProps) {
  const { stretch, side, remainingMs, durationMs, running, pulse, nextHint } = session
  const sideText = sideLabel(side)

  return (
    <div className="screen session">
      <header className="session-top">
        <p className="brand-kicker">
          Stretch {stretch.number} of {ROUTINE.length}
        </p>
        <ol className="dots" aria-label={`Progress, stretch ${stretch.number} of ${ROUTINE.length}`}>
          {ROUTINE.map((item) => (
            <li
              key={item.id}
              className={
                item.number < stretch.number
                  ? 'is-done'
                  : item.number === stretch.number
                    ? 'is-now'
                    : ''
              }
            />
          ))}
        </ol>
        <button className="text-btn" type="button" onClick={onToggleMute}>
          {muted ? 'Chime off' : 'Chime on'}
        </button>
      </header>

      <article className={`active-card ${pulse ? 'is-pulse' : ''}`}>
        <div className="active-head">
          <div>
            <p className="purpose">{stretch.purpose}</p>
            <h2>{stretch.name}</h2>
            {sideText && <p className="side-pill">{sideText}</p>}
          </div>
          <a
            className="demo-fab"
            href={stretch.demoUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Watch demo for ${stretch.name}`}
            title="Watch demo"
          >
            ?
          </a>
        </div>

        <TimerRing remainingMs={remainingMs} durationMs={durationMs} pulse={pulse} />

        <p className="cue">{stretch.cue}</p>
        {stretch.extraNote && <p className="extra">{stretch.extraNote}</p>}
        <div className="demo-row">
          <a className="demo-link" href={stretch.demoUrl} target="_blank" rel="noreferrer">
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
        <p className="next-hint">{nextHint}</p>
      </article>

      <div className="session-actions">
        <button
          className="primary"
          type="button"
          onClick={running ? session.pause : session.resume}
        >
          {running ? 'Pause' : 'Resume'}
        </button>
        <button className="ghost" type="button" onClick={session.skip}>
          Skip
        </button>
        <button className="text-btn end-early" type="button" onClick={session.endEarly}>
          End early
        </button>
      </div>
    </div>
  )
}
