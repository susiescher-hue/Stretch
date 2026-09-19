export type Side = 'left' | 'right'

export interface Stretch {
  id: string
  number: number
  name: string
  purpose: string
  cue: string
  seconds: number
  bilateral: boolean
  demoUrl: string
  extraNote?: string
  extraDemo?: { label: string; url: string }
}

export const ROUTINE: Stretch[] = [
  {
    id: 'cat-cow',
    number: 1,
    name: 'Cat-Cow',
    purpose: 'Wake the spine',
    cue: 'Move with the breath. Inhale, soften the belly and look a little up. Exhale, round and let the head hang. Easy range.',
    seconds: 60,
    bilateral: false,
    demoUrl: 'https://www.youtube.com/watch?v=y39PrKY_4JM',
  },
  {
    id: 'open-book',
    number: 2,
    name: 'Open-Book Thoracic Rotation',
    purpose: 'Unwind the mid-back',
    cue: 'Lie on your side, knees stacked. Open the top arm like a book and let the chest follow. Rest where it feels easy.',
    seconds: 40,
    bilateral: true,
    demoUrl: 'https://www.youtube.com/watch?v=YMswmjk7Qj4',
  },
  {
    id: 'chin-tucks',
    number: 3,
    name: 'Chin Tucks + gentle neck side bend',
    purpose: 'Ease the neck',
    cue: 'Gently draw the chin back, as if making a small double chin. Then a soft side bend — ear toward shoulder. No forcing.',
    seconds: 45,
    bilateral: false,
    demoUrl: 'https://www.youtube.com/watch?v=HBjR_xEYd-4',
  },
  {
    id: 'worlds-greatest',
    number: 4,
    name: 'World’s Greatest Stretch',
    purpose: 'Open hips and rotation',
    cue: 'Long lunge, hand inside the front foot. Rotate the chest open toward the front knee. Keep the back knee soft.',
    seconds: 45,
    bilateral: true,
    demoUrl: 'https://www.youtube.com/watch?v=-rK5otzYmt4',
  },
  {
    id: 'hip-flexor',
    number: 5,
    name: 'Half-Kneeling Hip Flexor',
    purpose: 'Her biggest need — very tight hips',
    cue: 'Tall half-kneel. Tuck the pelvis a little and ease the hips forward until the front of the back hip speaks. Breathe.',
    seconds: 60,
    bilateral: true,
    demoUrl: 'https://www.youtube.com/watch?v=bnVfloe6yTo',
    extraNote:
      'Want deeper? Use a couch stretch against a wall or couch — same side, same minute.',
    extraDemo: {
      label: 'Deeper couch stretch',
      url: 'https://www.youtube.com/watch?v=m2u7jOCMyBg',
    },
  },
  {
    id: 'figure-4',
    number: 6,
    name: 'Figure-4 Glute / Hip',
    purpose: 'Soften the outer hip',
    cue: 'Ankle on the opposite knee. Draw the thigh in until you feel the outer hip. Soften the jaw and unclench the toes.',
    seconds: 45,
    bilateral: true,
    demoUrl: 'https://www.youtube.com/watch?v=VgjgTGnBkx0',
  },
  {
    id: 'hamstring',
    number: 7,
    name: 'Supine Hamstring with strap/towel/belt',
    purpose: 'Lengthen the back of the leg',
    cue: 'On your back, strap around the foot. Straighten the knee as far as comfortable. Keep the other hip heavy on the floor.',
    seconds: 45,
    bilateral: true,
    demoUrl: 'https://www.youtube.com/watch?v=Il1L75v6gq0',
  },
  {
    id: 'childs-pose',
    number: 8,
    name: 'Child’s Pose breathing',
    purpose: 'Finish',
    cue: 'Hips toward heels, arms long. Breathe into the back ribs. Nothing left to do — just arrive here.',
    seconds: 45,
    bilateral: false,
    demoUrl: 'https://www.youtube.com/watch?v=_ZX_zTOBgp8',
  },
]

export const SWITCH_HOLD_MS = 4000

export function stretchDurationMs(stretch: Stretch): number {
  return stretch.seconds * 1000 * (stretch.bilateral ? 2 : 1)
}

export function totalRoutineSeconds(): number {
  return ROUTINE.reduce((sum, stretch) => sum + stretch.seconds * (stretch.bilateral ? 2 : 1), 0)
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function sideLabel(side: Side | null): string | null {
  if (side === 'left') return 'Left side'
  if (side === 'right') return 'Right side'
  return null
}
