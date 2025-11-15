import { describe, it, expect } from 'vitest'
import { quantizeSegmentsToNotes } from '@/logic/quantizer'
import { ParsedSegment } from '@/types/rhythm'

describe('quantizeSegmentsToNotes', () => {
  it('単一の音を16分音符にマッピングする', () => {
    const segments: ParsedSegment[] = [
      { text: 'タ', characterCount: 1, isRest: false }
    ]
    const result = quantizeSegmentsToNotes(segments)

    expect(result).toHaveLength(1)
    expect(result[0].startBeat).toBe(0)
    expect(result[0].durationBeats).toBe(0.25)
    expect(result[0].isRest).toBe(false)
  })

  it('文字数に比例した長さを割り当てる', () => {
    const segments: ParsedSegment[] = [
      { text: 'タ', characterCount: 1, isRest: false },
      { text: 'トゥー', characterCount: 3, isRest: false }
    ]
    const result = quantizeSegmentsToNotes(segments)

    expect(result).toHaveLength(2)
    expect(result[0].durationBeats).toBe(0.25)
    expect(result[1].durationBeats).toBe(0.75)
  })

  it('休符を正しく処理する', () => {
    const segments: ParsedSegment[] = [
      { text: 'タ', characterCount: 1, isRest: false },
      { text: ' ', characterCount: 1, isRest: true },
      { text: 'タ', characterCount: 1, isRest: false }
    ]
    const result = quantizeSegmentsToNotes(segments)

    expect(result).toHaveLength(3)
    expect(result[0].isRest).toBe(false)
    expect(result[0].startBeat).toBe(0)
    expect(result[1].isRest).toBe(true)
    expect(result[1].startBeat).toBe(0.25)
    expect(result[2].isRest).toBe(false)
    expect(result[2].startBeat).toBe(0.5)
  })

  it('連続した音のstartBeatを正しく計算する', () => {
    const segments: ParsedSegment[] = [
      { text: 'タ', characterCount: 1, isRest: false },
      { text: 'タ', characterCount: 1, isRest: false },
      { text: 'トゥー', characterCount: 3, isRest: false }
    ]
    const result = quantizeSegmentsToNotes(segments)

    expect(result[0].startBeat).toBe(0)
    expect(result[1].startBeat).toBe(0.25)
    expect(result[2].startBeat).toBe(0.5)
    expect(result[2].durationBeats).toBe(0.75)
  })

  it('複雑なパターンを量子化する', () => {
    const segments: ParsedSegment[] = [
      { text: 'ドゥン', characterCount: 3, isRest: false },
      { text: ' ', characterCount: 2, isRest: true },
      { text: 'タッタ', characterCount: 3, isRest: false }
    ]
    const result = quantizeSegmentsToNotes(segments)

    expect(result).toHaveLength(3)
    expect(result[0].durationBeats).toBe(0.75)
    expect(result[1].durationBeats).toBe(0.5)
    expect(result[2].durationBeats).toBe(0.75)
    expect(result[2].startBeat).toBe(1.25)
  })

  it('各ノートにユニークなIDを割り当てる', () => {
    const segments: ParsedSegment[] = [
      { text: 'タ', characterCount: 1, isRest: false },
      { text: 'タ', characterCount: 1, isRest: false }
    ]
    const result = quantizeSegmentsToNotes(segments)

    expect(result[0].id).toBeDefined()
    expect(result[1].id).toBeDefined()
    expect(result[0].id).not.toBe(result[1].id)
  })
})
