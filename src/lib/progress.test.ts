import { describe, expect, it } from 'vitest'
import { ROUTINE, totalRoutineSeconds } from '../data/routine'
import { advance, initialStep } from './progress'

describe('routine', () => {
  it('has eight stretches with demo links', () => {
    expect(ROUTINE).toHaveLength(8)
    for (const stretch of ROUTINE) {
      expect(stretch.demoUrl).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/)
    }
  })

  it('is about ten minutes including switch-side time', () => {
    expect(totalRoutineSeconds()).toBe(620)
  })
})

describe('advance', () => {
  it('starts on cat-cow with no side', () => {
    expect(initialStep()).toEqual({ kind: 'stretch', index: 0, side: null })
  })

  it('inserts a switch after the first side of a bilateral stretch', () => {
    const openBookLeft = { kind: 'stretch' as const, index: 1, side: 'left' as const }
    expect(advance(openBookLeft)).toEqual({ kind: 'switch', index: 1 })
    expect(advance({ kind: 'switch', index: 1 })).toEqual({
      kind: 'stretch',
      index: 1,
      side: 'right',
    })
  })

  it('walks the full session to done', () => {
    let step = initialStep()
    let guard = 0
    while (step.kind !== 'done' && guard < 40) {
      step = advance(step)
      guard += 1
    }
    expect(step).toEqual({ kind: 'done' })
    expect(guard).toBe(18)
  })
})
