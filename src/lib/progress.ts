import { ROUTINE, type Side } from '../data/routine'

export type Step =
  | { kind: 'stretch'; index: number; side: Side | null }
  | { kind: 'switch'; index: number }
  | { kind: 'done' }

export type ChimeCue = 'segment' | 'switch' | 'session'

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

export function chimeCuesOnFinish(step: Step): ChimeCue[] {
  if (step.kind === 'stretch') {
    const cues: ChimeCue[] = ['segment']
    if (advance(step).kind === 'done') cues.push('session')
    return cues
  }
  if (step.kind === 'switch') return ['switch']
  return []
}

export function describeCue(step: Step, cue: ChimeCue): string {
  if (cue === 'session') return 'session'
  if (step.kind === 'switch') return `switch:${ROUTINE[step.index].id}`
  if (step.kind === 'stretch') {
    return `segment:${ROUTINE[step.index].id}:${step.side ?? 'center'}`
  }
  return cue
}

export function allSessionChimeLabels(): string[] {
  const labels: string[] = []
  let step = initialStep()
  let guard = 0
  while (step.kind !== 'done' && guard < 40) {
    for (const cue of chimeCuesOnFinish(step)) {
      labels.push(describeCue(step, cue))
    }
    step = advance(step)
    guard += 1
  }
  return labels
}
