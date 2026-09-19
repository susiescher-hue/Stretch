import { useCallback, useEffect, useRef, useState } from 'react'
import { ROUTINE, SWITCH_HOLD_MS } from '../data/routine'
import { hapticPulse, playChime, unlockAudio } from '../lib/chime'
import { advance, initialStep, type Step } from '../lib/progress'

export type Screen = 'home' | 'active' | 'switch' | 'complete'

const ADVANCE_FLASH_MS = 700

export function useSession(options: { muted: boolean; onComplete: () => void }) {
  const [screen, setScreen] = useState<Screen>('home')
  const [step, setStep] = useState<Step>(initialStep)
  const [running, setRunning] = useState(false)
  const [remainingMs, setRemainingMs] = useState(0)
  const [endAt, setEndAt] = useState<number | null>(null)
  const [pulse, setPulse] = useState(false)
  const [switchLeftMs, setSwitchLeftMs] = useState(SWITCH_HOLD_MS)

  const finishingRef = useRef(false)
  const switchLockRef = useRef(false)
  const onCompleteRef = useRef(options.onComplete)
  const mutedRef = useRef(options.muted)

  useEffect(() => {
    onCompleteRef.current = options.onComplete
  }, [options.onComplete])

  useEffect(() => {
    mutedRef.current = options.muted
  }, [options.muted])

  const signalEnd = useCallback(() => {
    setPulse(true)
    window.setTimeout(() => setPulse(false), 900)
    if (!mutedRef.current) playChime()
    hapticPulse()
  }, [])

  const beginStretch = useCallback((next: Extract<Step, { kind: 'stretch' }>) => {
    const stretch = ROUTINE[next.index]
    const ms = stretch.seconds * 1000
    setStep(next)
    setScreen('active')
    setRemainingMs(ms)
    setEndAt(Date.now() + ms)
    setRunning(true)
    finishingRef.current = false
  }, [])

  const goHome = useCallback(() => {
    setScreen('home')
    setStep(initialStep())
    setRunning(false)
    setEndAt(null)
    setRemainingMs(0)
    setPulse(false)
    finishingRef.current = false
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
        switchLockRef.current = false
        setStep(next)
        setRunning(false)
        setEndAt(Date.now() + SWITCH_HOLD_MS)
        setSwitchLeftMs(SWITCH_HOLD_MS)
        setScreen('switch')
        return
      }
      beginStretch(next)
    },
    [beginStretch],
  )

  const finishCurrent = useCallback(() => {
    if (finishingRef.current) return
    finishingRef.current = true
    setRunning(false)
    signalEnd()
    window.setTimeout(() => {
      moveOn(step)
    }, ADVANCE_FLASH_MS)
  }, [moveOn, signalEnd, step])

  useEffect(() => {
    if (screen !== 'active' || !running || endAt === null) return

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

  useEffect(() => {
    if (screen !== 'switch' || endAt === null) return

    let frame = 0
    const tick = () => {
      const left = endAt - Date.now()
      if (left <= 0) {
        if (switchLockRef.current) return
        switchLockRef.current = true
        setSwitchLeftMs(0)
        finishingRef.current = false
        moveOn(step)
        return
      }
      setSwitchLeftMs(left)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [endAt, moveOn, screen, step])

  const start = useCallback(async () => {
    await unlockAudio()
    beginStretch(initialStep() as Extract<Step, { kind: 'stretch' }>)
  }, [beginStretch])

  const pause = useCallback(() => {
    if (!running || endAt === null) return
    setRemainingMs(Math.max(0, endAt - Date.now()))
    setEndAt(null)
    setRunning(false)
  }, [endAt, running])

  const resume = useCallback(async () => {
    await unlockAudio()
    if (running || screen !== 'active') return
    setEndAt(Date.now() + remainingMs)
    setRunning(true)
  }, [remainingMs, running, screen])

  const skip = useCallback(() => {
    if (screen === 'switch') {
      if (switchLockRef.current) return
      switchLockRef.current = true
      finishingRef.current = false
      moveOn(step)
      return
    }
    if (screen !== 'active') return
    finishCurrent()
  }, [finishCurrent, moveOn, screen, step])

  const endEarly = useCallback(() => {
    goHome()
  }, [goHome])

  const stretch = step.kind === 'done' ? ROUTINE[ROUTINE.length - 1] : ROUTINE[step.index]
  const side = step.kind === 'stretch' ? step.side : step.kind === 'switch' ? 'left' : null
  const durationMs = stretch.seconds * 1000
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
    switchLeftMs,
    nextHint,
    start,
    pause,
    resume,
    skip,
    endEarly,
    goHome,
  }
}
