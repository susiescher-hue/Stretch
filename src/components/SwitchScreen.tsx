import { formatClock, sideLabel } from '../data/routine'
import type { useSession } from '../hooks/useSession'

type Session = ReturnType<typeof useSession>

interface SwitchScreenProps {
  session: Session
}

export function SwitchScreen({ session }: SwitchScreenProps) {
  const { stretch, switchLeftMs } = session

  return (
    <div className="screen switch">
      <article className="switch-card is-pulse">
        <p className="brand-kicker">Switch sides</p>
        <h2>{stretch.name}</h2>
        <p className="lede">
          Come off {sideLabel('left')?.toLowerCase()} and settle onto the right.
          Same shape. Same easy breath.
        </p>
        <p className="switch-count" aria-live="polite">
          {formatClock(switchLeftMs)}
        </p>
        <button className="primary" type="button" onClick={session.skip}>
          I’m ready
        </button>
        <a className="demo-link" href={stretch.demoUrl} target="_blank" rel="noreferrer">
          Watch demo
        </a>
      </article>
    </div>
  )
}
