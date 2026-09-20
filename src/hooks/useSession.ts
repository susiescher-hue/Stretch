import { useCallback, useEffect, useRef, useState } from 'react'
import { ROUTINE, SWITCH_HOLD_MS } from '../data/routine'
import { hapticPulse, playChime, releaseAudio, unlockAudio } from '../lib/chime'
import { advance, chimeCuesOnFinish, initialStep, type Step } from '../lib/progress'

export type Screen = 'home' | 'active' | 'switch' | 'complete'

const ADVANCE_FLASH_MS = 650
const SESSION_CHIME_GAP_MS = 420

export function useSession(options: { muted: boolean; onComplete: () => void }) {
  const [screen, setScreen] = useState<Screen>('home')
  const [step, setStep] = useState<Step>(initialStep)
  const [running, setRunning] = useState(false)
  const [remainingMs, setRemainingMs] = useState(0)
  const [endAt, setEndAt] = useState<number | null>(null)
  const [pulse, setPulse] = useState(false)

  const finishingRef = useRef(false)
  const stepRef = useRef(step)
  const onCompleteRef = useRef(options.onComplete)
  const mutedRef = useRef(options.muted)

  useEffect(() => {
    stepRef.current = step
  }, [step])

  useEffect(() => {
    onCompleteRef.current = options.onComplete
  }, [options.onComplete])

  useEffect(() => {
    mutedRef.current = options.muted
  }, [options.muted])

  const ding = useCallback((count = 1) => {
    setPulse(true)
    window.setTimeout(() => setPulse(false), 900)
    if (mutedRef.current) {
      hapticPulse()
      return
    }
    void playChime()
    hapticPulse()
    if (count > 1) {
      window.setTimeout(() => {
        if (!mutedRef.current) void playChime()
        hapticPulse()
      }, SESSION_CHIME_GAP_MS)
    }
  }, [])

  const beginStretch = useCallback((next: Extract<Step, { kind: 'stretch' }>) => {
    const stretch = ROUTINE[next.index]
    const ms = stretch.seconds * 1000
    finishingRef.current = false
    setStep(next)
    setScreen('active')
    setRemainingMs(ms)
    setEndAt(Date.now() + ms)
    setRunning(true)
  }, [])

  const beginSwitch = useCallback((next: Extract<Step, { kind: 'switch' }>) => {
    finishingRef.current = false
    setStep(next)
    setScreen('switch')
    setRemainingMs(SWITCH_HOLD_MS)
    setEndAt(Date.now() + SWITCH_HOLD_MS)
    setRunning(true)
  }, [])

  const goHome = useCallback(() => {
    finishingRef.current = false
    setScreen('home')
    setStep(initialStep())
    setRunning(false)
    setEndAt(null)
    setRemainingMs(0)
    setPulse(false)
    releaseAudio()
  }, [])

  const moveOn = useCallback(
    (from: Step) => {
      const next = advance(from)
      if (next.kind === 'done') {
        setStep(next)
        setRunning(false)
        setEndAt(null)
        setScreen('complete')
        onCompleteRef.current()
        return
      }
      if (next.kind === 'switch') {
        beginSwitch(next)
        return
      }
      beginStretch(next)
    },
    [beginStretch, beginSwitch],
  )

  const finishCurrent = useCallback(() => {
    if (finishingRef.current) return
    finishingRef.current = true
    setRunning(false)
    const current = stepRef.current
    const cues = chimeCuesOnFinish(current)
    if (cues.length > 0) ding(cues.length)
    window.setTimeout(() => {
      moveOn(current)
    }, ADVANCE_FLASH_MS)
  }, [ding, moveOn])

  useEffect(() => {
    if (!running || endAt === null) return
    if (screen !== 'active' && screen !== 'switch') return

    let frame = 0
    const tick = () => {
      const left = endAt - Date.now()
      if (left <= 0) {
        setRemainingMs(0)
        finishCurrent()
        return
      }
      setRemainingMs(left)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [endAt, finishCurrent, running, screen])

  const start = useCallback(async () => {
    await unlockAudio()
    beginStretch(initialStep() as Extract<Step, { kind: 'stretch' }>)
  }, [beginStretch])

  const pause = useCallback(() => {
    void unlockAudio()
    if (!running || endAt === null || screen !== 'active') return
    setRemainingMs(Math.max(0, endAt - Date.now()))
    setEndAt(null)
    setRunning(false)
  }, [endAt, running, screen])

  const resume = useCallback(async () => {
    await unlockAudio()
    if (running || screen !== 'active') return
    setEndAt(Date.now() + remainingMs)
    setRunning(true)
  }, [remainingMs, running, screen])

  const skip = useCallback(async () => {
    await unlockAudio()
    if (screen !== 'active' && screen !== 'switch') return
    finishCurrent()
  }, [finishCurrent, screen])

  const endEarly = useCallback(() => {
    goHome()
  }, [goHome])

  const stretch = step.kind === 'done' ? ROUTINE[ROUTINE.length - 1] : ROUTINE[step.index]
  const side = step.kind === 'stretch' ? step.side : step.kind === 'switch' ? 'left' : null
  const durationMs = screen === 'switch' ? SWITCH_HOLD_MS : stretch.seconds * 1000
  const nextHint = (() => {
    if (step.kind === 'stretch' && stretch.bilateral && step.side === 'left') {
      return 'Then switch sides'
    }
    if (step.kind === 'switch') return `Then ${stretch.name}, right side`
    if (step.kind === 'done' || step.index >= ROUTINE.length - 1) return 'Then you’re done'
    return `Next: ${ROUTINE[step.index + 1].name}`
  })()

  return {
    screen,
    step,
    stretch,
    side,
    running,
    remainingMs,
    durationMs,
    pulse,
    switchLeftMs: remainingMs,
    nextHint,
    start,
    pause,
    resume,
    skip,
    endEarly,
    goHome,
  }
}
