import { describe, expect, it } from 'vitest'
import { computeStreak, shiftStamp } from './dates'

describe('computeStreak', () => {
  it('returns 0 when nothing is logged', () => {
    expect(computeStreak([], '2026-09-19')).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    expect(
      computeStreak(['2026-09-17', '2026-09-18', '2026-09-19'], '2026-09-19'),
    ).toBe(3)
  })

  it('still counts if yesterday is the latest day', () => {
    expect(computeStreak(['2026-09-17', '2026-09-18'], '2026-09-19')).toBe(2)
  })

  it('breaks on a gap', () => {
    expect(computeStreak(['2026-09-16', '2026-09-19'], '2026-09-19')).toBe(1)
  })
})

describe('shiftStamp', () => {
  it('crosses month boundaries', () => {
    expect(shiftStamp('2026-10-01', -1)).toBe('2026-09-30')
  })
})
