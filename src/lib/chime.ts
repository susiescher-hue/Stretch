let context: AudioContext | null = null

function audioContext(): AudioContext | null {
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  context ??= new Ctor()
  return context
}

export async function unlockAudio(): Promise<void> {
  const ctx = audioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
}

export function playChime(): void {
  const ctx = audioContext()
  if (!ctx || ctx.state !== 'running') return

  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99]

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = now + index * 0.11
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.055, start + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.62)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.66)
  })
}

export function hapticPulse(): void {
  try {
    navigator.vibrate?.(36)
  } catch {
    // Some browsers expose vibrate but reject it.
  }
}
