import { ROUTINE, type Side } from '../data/routine'

export type Step =
  | { kind: 'stretch'; index: number; side: Side | null }
  | { kind: 'switch'; index: number }
  | { kind: 'done' }

export function initialStep(): Step {
  const first = ROUTINE[0]
  return {
    kind: 'stretch',
    index: 0,
    side: first.bilateral ? 'left' : null,
  }
}

export function advance(step: Step): Step {
  if (step.kind === 'done') return step

  if (step.kind === 'switch') {
    return { kind: 'stretch', index: step.index, side: 'right' }
  }

  const stretch = ROUTINE[step.index]
  if (stretch.bilateral && step.side === 'left') {
    return { kind: 'switch', index: step.index }
  }

  if (step.index >= ROUTINE.length - 1) {
    return { kind: 'done' }
  }

  const next = ROUTINE[step.index + 1]
  return {
    kind: 'stretch',
    index: step.index + 1,
    side: next.bilateral ? 'left' : null,
  }
}

export function currentStretch(step: Step) {
  if (step.kind === 'done') return null
  return ROUTINE[step.index]
}

export function chimesWhenFinished(step: Step): boolean {
  return step.kind === 'stretch'
}
