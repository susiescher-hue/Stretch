const SAMPLE_RATE = 22050
const DING_POOL = 4

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
let hold: HTMLAudioElement | null = null
let pool: HTMLAudioElement[] = []
let poolIndex = 0
let dingUri: string | null = null
let silenceUri: string | null = null
let listening = false

export function encodePcmWav(samples: Int16Array): string {
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
  bytes.set(new Uint8Array(samples.buffer, samples.byteOffset, samples.byteLength), 44)

  let binary = ''
  const chunk = 8192
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return `data:audio/wav;base64,${btoa(binary)}`
}

export function buildDingDataUri(): string {
  const duration = 0.62
  const total = Math.floor(SAMPLE_RATE * duration)
  const samples = new Int16Array(total)
  const notes = [
    { freq: 659.25, start: 0, end: 0.28 },
    { freq: 783.99, start: 0.1, end: 0.4 },
    { freq: 987.77, start: 0.22, end: 0.62 },
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
    samples[i] = Math.round(Math.max(-1, Math.min(1, value * 0.55)) * 0x7fff)
  }

  return encodePcmWav(samples)
}

export function buildSilenceDataUri(): string {
  return encodePcmWav(new Int16Array(Math.floor(SAMPLE_RATE * 0.35)))
}

function audioContext(): AudioContext | null {
  const Ctor = audioCtor()
  if (!Ctor) return null
  context ??= new Ctor()
  return context
}

function attachHidden(el: HTMLAudioElement): void {
  el.setAttribute('playsinline', 'true')
  el.setAttribute('webkit-playsinline', 'true')
  el.setAttribute('aria-hidden', 'true')
  el.preload = 'auto'
  if (typeof document !== 'undefined' && !el.isConnected) {
    el.style.position = 'absolute'
    el.style.width = '0'
    el.style.height = '0'
    el.style.opacity = '0'
    document.body.appendChild(el)
  }
}

function makeAudio(src: string, loop = false): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  const el = new Audio(src)
  el.loop = loop
  attachHidden(el)
  return el
}

function dingPool(): HTMLAudioElement[] {
  dingUri ??= buildDingDataUri()
  if (pool.length === 0) {
    for (let i = 0; i < DING_POOL; i += 1) {
      const el = makeAudio(dingUri)
      if (el) pool.push(el)
    }
  }
  return pool
}

function holdAudio(): HTMLAudioElement | null {
  if (hold) return hold
  silenceUri ??= buildSilenceDataUri()
  hold = makeAudio(silenceUri, true)
  if (hold) hold.volume = 0.01
  return hold
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
    osc.frequency.value = 40
    gain.gain.value = 0.00002
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
  const notes = [659.25, 783.99, 987.77]
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = now + index * 0.09
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.18, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.55)
  })
}

async function playFromPool(): Promise<boolean> {
  const clips = dingPool()
  if (clips.length === 0) return false
  const el = clips[poolIndex % clips.length]
  poolIndex += 1
  try {
    el.pause()
    el.currentTime = 0
    el.volume = 0.9
    const play = el.play()
    if (play) await play
    return true
  } catch {
    return false
  }
}

async function primeElement(el: HTMLAudioElement, restoreVolume: number): Promise<void> {
  const previous = el.volume
  try {
    el.volume = 0.01
    const play = el.play()
    if (play) await play
    if (!el.loop) {
      el.pause()
      el.currentTime = 0
    }
  } catch {
    // Gesture unlock can still fail; later plays retry.
  } finally {
    if (!el.loop) el.volume = restoreVolume
    else el.volume = previous || 0.01
  }
}

function listenForForeground(): void {
  if (listening || typeof document === 'undefined') return
  listening = true
  const bump = () => {
    void resumeContext().then((ctx) => {
      if (ctx) startKeepAlive(ctx)
    })
    const holdEl = holdAudio()
    if (holdEl && holdEl.paused) void holdEl.play().catch(() => undefined)
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') bump()
  })
  window.addEventListener('pageshow', bump)
}

export async function unlockAudio(): Promise<void> {
  listenForForeground()
  const ctx = await resumeContext()
  if (ctx) startKeepAlive(ctx)

  const holdEl = holdAudio()
  if (holdEl) await primeElement(holdEl, 0.01)

  for (const clip of dingPool()) {
    await primeElement(clip, 0.9)
  }
}

export async function playChime(): Promise<void> {
  const ctx = await resumeContext()
  if (ctx) {
    startKeepAlive(ctx)
    playWebChime(ctx)
  }
  await playFromPool()
}

export function releaseAudio(): void {
  if (hold) {
    hold.pause()
    hold.currentTime = 0
  }
}

export function hapticPulse(): void {
  try {
    navigator.vibrate?.(40)
  } catch {
    // Some browsers expose vibrate but reject it.
  }
}
