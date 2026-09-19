import { computeStreak, todayStamp } from './dates'

export const STORAGE_KEY = 'susie-stretch-v1'

export interface AppState {
  version: 1
  lastCompleted: string | null
  completedDates: string[]
  muted: boolean
}

export function defaultState(): AppState {
  return {
    version: 1,
    lastCompleted: null,
    completedDates: [],
    muted: false,
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    const completedDates = Array.isArray(parsed.completedDates)
      ? parsed.completedDates.filter((value): value is string => typeof value === 'string')
      : []
    return {
      version: 1,
      lastCompleted:
        typeof parsed.lastCompleted === 'string' ? parsed.lastCompleted : null,
      completedDates,
      muted: Boolean(parsed.muted),
    }
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function markDayComplete(state: AppState, day = todayStamp()): AppState {
  const completedDates = state.completedDates.includes(day)
    ? state.completedDates
    : [...state.completedDates, day]
  return {
    ...state,
    lastCompleted: day,
    completedDates,
  }
}

export function streakFrom(state: AppState, today = todayStamp()): number {
  return computeStreak(state.completedDates, today)
}

export function isDoneToday(state: AppState, today = todayStamp()): boolean {
  return state.lastCompleted === today || state.completedDates.includes(today)
}
