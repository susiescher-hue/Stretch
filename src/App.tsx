import { CompleteScreen } from './components/CompleteScreen'
import { HomeScreen } from './components/HomeScreen'
import { SessionScreen } from './components/SessionScreen'
import { SwitchScreen } from './components/SwitchScreen'
import { usePersist } from './hooks/usePersist'
import { useSession } from './hooks/useSession'

export default function App() {
  const persist = usePersist()
  const session = useSession({
    muted: persist.state.muted,
    onComplete: persist.completeToday,
  })

  return (
    <div className="app">
      {session.screen === 'home' && (
        <HomeScreen
          streak={persist.streak}
          lastCompleted={persist.state.lastCompleted}
          doneToday={persist.doneToday}
          muted={persist.state.muted}
          onToggleMute={() => persist.setMuted(!persist.state.muted)}
          onStart={session.start}
          onMarkComplete={persist.completeToday}
        />
      )}
      {session.screen === 'active' && (
        <SessionScreen
          session={session}
          muted={persist.state.muted}
          onToggleMute={() => persist.setMuted(!persist.state.muted)}
        />
      )}
      {session.screen === 'switch' && <SwitchScreen session={session} />}
      {session.screen === 'complete' && (
        <CompleteScreen streak={persist.streak} onHome={session.goHome} />
      )}
    </div>
  )
}
