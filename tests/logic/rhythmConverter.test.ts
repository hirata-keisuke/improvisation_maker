import { describe, it, expect } from 'vitest'
import { convertOnsetsToNotes } from '@/logic/rhythmConverter'

describe('convertOnsetsToNotes', () => {
  it('単一のオンセットをノートに変換する', () => {
    const onsets = [0]
    const bpm = 120
    const result = convertOnsetsToNotes(onsets, bpm)

    expect(result).toHaveLength(1)
    expect(result[0].startBeat).toBe(0)
    expect(result[0].isRest).toBe(false)
  })

  it('複数のオンセットをノートに変換する', () => {
    const onsets = [0, 0.5, 1.0]
    const bpm = 120
    const result = convertOnsetsToNotes(onsets, bpm)

    expect(result).toHaveLength(3)
    expect(result[0].startBeat).toBe(0)
    expect(result[1].startBeat).toBeCloseTo(1, 1)
    expect(result[2].startBeat).toBeCloseTo(2, 1)
  })

  it('音の長さを次のオンセットまでの時間から計算する', () => {
    const onsets = [0, 0.5]
    const bpm = 120
    const result = convertOnsetsToNotes(onsets, bpm)

    expect(result[0].durationBeats).toBeCloseTo(1, 1)
  })

  it('最後のノートにはデフォルトの長さを設定する', () => {
    const onsets = [0]
    const bpm = 120
    const result = convertOnsetsToNotes(onsets, bpm)

    expect(result[0].durationBeats).toBe(1)
  })

  it('16分音符にQuantizeする', () => {
    const onsets = [0, 0.13]
    const bpm = 120
    const result = convertOnsetsToNotes(onsets, bpm)

    expect(result[0].startBeat).toBe(0)
    expect(result[1].startBeat).toBe(0.25)
  })

  it('各ノートにユニークなIDを割り当てる', () => {
    const onsets = [0, 0.5]
    const bpm = 120
    const result = convertOnsetsToNotes(onsets, bpm)

    expect(result[0].id).toBeDefined()
    expect(result[1].id).toBeDefined()
    expect(result[0].id).not.toBe(result[1].id)
  })
})
