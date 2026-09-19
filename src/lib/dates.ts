export function todayStamp(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function shiftStamp(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return todayStamp(date)
}

export function formatStamp(isoDate: string | null): string {
  if (!isoDate) return 'Not yet'
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function computeStreak(dates: string[], today = todayStamp()): number {
  const set = new Set(dates)
  let cursor = today
  if (!set.has(cursor)) {
    cursor = shiftStamp(today, -1)
    if (!set.has(cursor)) return 0
  }

  let streak = 0
  while (set.has(cursor)) {
    streak += 1
    cursor = shiftStamp(cursor, -1)
  }
  return streak
}
