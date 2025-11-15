import { describe, it, expect, beforeEach } from 'vitest'
import { detectOnsets, calculateRMS } from '@/logic/onsetDetector'

describe('calculateRMS', () => {
  it('無音の場合は0を返す', () => {
    const samples = new Float32Array([0, 0, 0, 0])
    const rms = calculateRMS(samples, 0, 4)
    expect(rms).toBe(0)
  })

  it('一定の音量の場合、正しいRMSを計算する', () => {
    const samples = new Float32Array([0.5, 0.5, 0.5, 0.5])
    const rms = calculateRMS(samples, 0, 4)
    expect(rms).toBeCloseTo(0.5, 2)
  })

  it('範囲指定で正しく計算する', () => {
    const samples = new Float32Array([0, 0, 1, 1, 0, 0])
    const rms = calculateRMS(samples, 2, 2)
    expect(rms).toBeCloseTo(1, 2)
  })
})

describe('detectOnsets', () => {
  let audioContext: AudioContext

  beforeEach(() => {
    audioContext = new AudioContext()
  })

  it('無音の場合、オンセットを検出しない', () => {
    const buffer = audioContext.createBuffer(1, 44100, 44100)
    const onsets = detectOnsets(buffer, 0.1)
    expect(onsets).toHaveLength(0)
  })

  it('単一のパルスを検出する', () => {
    const buffer = audioContext.createBuffer(1, 44100, 44100)
    const data = buffer.getChannelData(0)

    for (let i = 1000; i < 2000; i++) {
      data[i] = 0.8
    }

    const onsets = detectOnsets(buffer, 0.1)
    expect(onsets.length).toBeGreaterThan(0)
    expect(onsets[0]).toBeCloseTo(1000 / 44100, 1)
  })

  it('複数のパルスを検出する', () => {
    const buffer = audioContext.createBuffer(1, 44100, 44100)
    const data = buffer.getChannelData(0)

    for (let i = 1000; i < 2000; i++) {
      data[i] = 0.8
    }

    for (let i = 10000; i < 11000; i++) {
      data[i] = 0.8
    }

    const onsets = detectOnsets(buffer, 0.1)
    expect(onsets.length).toBeGreaterThanOrEqual(2)
  })

  it('しきい値以下の音は検出しない', () => {
    const buffer = audioContext.createBuffer(1, 44100, 44100)
    const data = buffer.getChannelData(0)

    for (let i = 1000; i < 2000; i++) {
      data[i] = 0.05
    }

    const onsets = detectOnsets(buffer, 0.1)
    expect(onsets).toHaveLength(0)
  })
})
