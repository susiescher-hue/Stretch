import { describe, expect, it } from 'vitest'
import { ROUTINE, totalRoutineSeconds } from '../data/routine'
import { advance, allSessionChimeLabels, chimeCuesOnFinish, initialStep } from './progress'

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

  it('uses Susie’s Child’s Pose demo', () => {
    const stretch = ROUTINE.find((item) => item.id === 'childs-pose')
    expect(stretch?.demoUrl).toBe('https://www.youtube.com/watch?v=Ndhfm1Jxu2U')
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

describe('chime cues', () => {
  it('dings on every stretch, every side switch, and session end', () => {
    const labels = allSessionChimeLabels()
    expect(labels).toEqual([
      'segment:cat-cow:center',
      'segment:open-book:left',
      'switch:open-book',
      'segment:open-book:right',
      'segment:chin-tucks:center',
      'segment:worlds-greatest:left',
      'switch:worlds-greatest',
      'segment:worlds-greatest:right',
      'segment:hip-flexor:left',
      'switch:hip-flexor',
      'segment:hip-flexor:right',
      'segment:figure-4:left',
      'switch:figure-4',
      'segment:figure-4:right',
      'segment:hamstring:left',
      'switch:hamstring',
      'segment:hamstring:right',
      'segment:childs-pose:center',
      'session',
    ])
  })

  it('treats both figure-4 and hamstring sides as ding events', () => {
    const labels = allSessionChimeLabels()
    expect(labels).toContain('segment:figure-4:left')
    expect(labels).toContain('switch:figure-4')
    expect(labels).toContain('segment:figure-4:right')
    expect(labels).toContain('segment:hamstring:left')
    expect(labels).toContain('switch:hamstring')
    expect(labels).toContain('segment:hamstring:right')
  })

  it('dings when a switch step finishes', () => {
    expect(chimeCuesOnFinish({ kind: 'switch', index: 5 })).toEqual(['switch'])
  })
})
