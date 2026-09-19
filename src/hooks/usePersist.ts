import { useCallback, useState } from 'react'
import {
  isDoneToday,
  loadState,
  markDayComplete,
  saveState,
  streakFrom,
  type AppState,
} from '../lib/storage'

export function usePersist() {
  const [state, setState] = useState<AppState>(() => loadState())

  const commit = useCallback((next: AppState) => {
    setState(next)
    saveState(next)
  }, [])

  const completeToday = useCallback(() => {
    commit(markDayComplete(state))
  }, [commit, state])

  const setMuted = useCallback(
    (muted: boolean) => {
      commit({ ...state, muted })
    },
    [commit, state],
  )

  return {
    state,
    streak: streakFrom(state),
    doneToday: isDoneToday(state),
    completeToday,
    setMuted,
  }
}
