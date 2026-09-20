import { describe, expect, it } from 'vitest'
import { buildDingDataUri, buildSilenceDataUri, encodePcmWav } from './chime'

function wavPayload(uri: string): string {
  expect(uri.startsWith('data:audio/wav;base64,')).toBe(true)
  return atob(uri.slice('data:audio/wav;base64,'.length))
}

describe('timer audio clips', () => {
  it('encodes a WAV ding the timer can play without a network file', () => {
    const binary = wavPayload(buildDingDataUri())
    expect(binary.slice(0, 4)).toBe('RIFF')
    expect(binary.slice(8, 12)).toBe('WAVE')
    expect(binary.length).toBeGreaterThan(1000)
  })

  it('encodes a silent looping clip to keep the phone audio session awake', () => {
    const binary = wavPayload(buildSilenceDataUri())
    expect(binary.slice(0, 4)).toBe('RIFF')
    expect(binary.slice(8, 12)).toBe('WAVE')
  })

  it('round-trips PCM samples into a wav header', () => {
    const binary = wavPayload(encodePcmWav(new Int16Array([0, 1, -1])))
    expect(binary.slice(36, 40)).toBe('data')
  })
})
