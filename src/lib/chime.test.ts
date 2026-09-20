import { describe, expect, it } from 'vitest'
import { buildDingDataUri } from './chime'

describe('buildDingDataUri', () => {
  it('encodes a WAV ding the timer can play without a network file', () => {
    const uri = buildDingDataUri()
    expect(uri.startsWith('data:audio/wav;base64,')).toBe(true)
    const binary = atob(uri.slice('data:audio/wav;base64,'.length))
    expect(binary.slice(0, 4)).toBe('RIFF')
    expect(binary.slice(8, 12)).toBe('WAVE')
    expect(binary.length).toBeGreaterThan(1000)
  })
})
