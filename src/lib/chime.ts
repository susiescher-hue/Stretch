const SAMPLE_RATE = 22050

function audioCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ||
    null
  )
}

let context: AudioContext | null = null
let keepAlive: OscillatorNode | null = null
let ding: HTMLAudioElement | null = null
let dingUri: string | null = null

export function buildDingDataUri(): string {
  const duration = 0.58
  const total = Math.floor(SAMPLE_RATE * duration)
  const samples = new Int16Array(total)
  const notes = [
    { freq: 523.25, start: 0, end: 0.3 },
    { freq: 659.25, start: 0.1, end: 0.42 },
    { freq: 783.99, start: 0.22, end: 0.58 },
  ]

  for (let i = 0; i < total; i += 1) {
    const t = i / SAMPLE_RATE
    let value = 0
    for (const note of notes) {
      if (t < note.start || t > note.end) continue
      const local = t - note.start
      const len = note.end - note.start
      const envelope = Math.sin(Math.PI * (local / len))
      value += Math.sin(2 * Math.PI * note.freq * t) * envelope
    }
    samples[i] = Math.round(Math.max(-1, Math.min(1, value * 0.42)) * 0x7fff)
  }

  const bytes = new Uint8Array(44 + samples.length * 2)
  const view = new DataView(bytes.buffer)
  const writeChars = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) bytes[offset + i] = text.charCodeAt(i)
  }

  writeChars(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeChars(8, 'WAVE')
  writeChars(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeChars(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  bytes.set(new Uint8Array(samples.buffer), 44)

  let binary = ''
  const chunk = 8192
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return `data:audio/wav;base64,${btoa(binary)}`
}

function audioContext(): AudioContext | null {
  const Ctor = audioCtor()
  if (!Ctor) return null
  context ??= new Ctor()
  return context
}

function getDing(): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  dingUri ??= buildDingDataUri()
  if (!ding) {
    ding = new Audio(dingUri)
    ding.preload = 'auto'
    ding.setAttribute('playsinline', 'true')
    ding.volume = 0.85
  }
  return ding
}

async function resumeContext(): Promise<AudioContext | null> {
  const ctx = audioContext()
  if (!ctx) return null
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      return ctx
    }
  }
  return ctx
}

function startKeepAlive(ctx: AudioContext): void {
  if (keepAlive) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 1
    gain.gain.value = 0.00001
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    keepAlive = osc
  } catch {
    keepAlive = null
  }
}

function playWebChime(ctx: AudioContext): void {
  if (ctx.state !== 'running') return
  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = now + index * 0.1
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.14, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.6)
  })
}

async function playHtmlDing(): Promise<boolean> {
  const el = getDing()
  if (!el) return false
  try {
    el.pause()
    el.currentTime = 0
    el.volume = 0.85
    const play = el.play()
    if (play) await play
    return true
  } catch {
    return false
  }
}

let listening = false

function listenForForeground(): void {
  if (listening || typeof document === 'undefined') return
  listening = true
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return
    void resumeContext().then((ctx) => {
      if (ctx) startKeepAlive(ctx)
    })
  })
}

export async function unlockAudio(): Promise<void> {
  listenForForeground()
  const ctx = await resumeContext()
  if (ctx) startKeepAlive(ctx)

  const el = getDing()
  if (!el) return
  const previous = el.volume
  try {
    el.volume = 0
    const play = el.play()
    if (play) await play
    el.pause()
    el.currentTime = 0
  } catch {
    // First play can still fail on some browsers; later chimes retry.
  } finally {
    el.volume = previous || 0.85
  }
}

export async function playChime(): Promise<void> {
  const ctx = await resumeContext()
  const htmlPlayed = await playHtmlDing()
  if (!htmlPlayed && ctx) playWebChime(ctx)
}

export function hapticPulse(): void {
  try {
    navigator.vibrate?.(40)
  } catch {
    // Some browsers expose vibrate but reject it.
  }
}
