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

  it('uses a short single-person World’s Greatest Stretch demo', () => {
    const stretch = ROUTINE.find((item) => item.id === 'worlds-greatest')
    expect(stretch?.demoUrl).toBe('https://www.youtube.com/watch?v=tCwUnHRi7jY')
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

  it('dings after every timed stretch, including both figure-4 sides', () => {
    const chimed: string[] = []
    let step = initialStep()
    let guard = 0
    while (step.kind !== 'done' && guard < 40) {
      if (step.kind === 'stretch') {
        chimed.push(`${ROUTINE[step.index].id}:${step.side ?? 'center'}`)
      }
      step = advance(step)
      guard += 1
    }
    expect(chimed).toContain('figure-4:left')
    expect(chimed).toContain('figure-4:right')
    expect(chimed.filter((id) => id.startsWith('figure-4:'))).toEqual([
      'figure-4:left',
      'figure-4:right',
    ])
    expect(chimed).toHaveLength(13)
  })
})
