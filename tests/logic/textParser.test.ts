import { describe, it, expect } from 'vitest'
import { parseTextToSegments } from '@/logic/textParser'

describe('parseTextToSegments', () => {
  it('単一の音を解析できる', () => {
    const result = parseTextToSegments('トゥー')
    expect(result).toEqual([
      { text: 'トゥー', characterCount: 3, isRest: false }
    ])
  })

  it('複数の音を解析できる', () => {
    const result = parseTextToSegments('トゥー ダ タ')
    expect(result).toEqual([
      { text: 'トゥー', characterCount: 3, isRest: false },
      { text: ' ', characterCount: 1, isRest: true },
      { text: 'ダ', characterCount: 1, isRest: false },
      { text: ' ', characterCount: 1, isRest: true },
      { text: 'タ', characterCount: 1, isRest: false }
    ])
  })

  it('スペースを休符として解釈する', () => {
    const result = parseTextToSegments('トゥー ダッ')
    expect(result).toEqual([
      { text: 'トゥー', characterCount: 3, isRest: false },
      { text: ' ', characterCount: 1, isRest: true },
      { text: 'ダッ', characterCount: 2, isRest: false }
    ])
  })

  it('連続するスペースを1つの休符として扱う', () => {
    const result = parseTextToSegments('トゥー   ダッ')
    expect(result).toEqual([
      { text: 'トゥー', characterCount: 3, isRest: false },
      { text: '   ', characterCount: 3, isRest: true },
      { text: 'ダッ', characterCount: 2, isRest: false }
    ])
  })

  it('空文字列の場合は空配列を返す', () => {
    const result = parseTextToSegments('')
    expect(result).toEqual([])
  })

  it('スペースのみの場合は休符のみを返す', () => {
    const result = parseTextToSegments('  ')
    expect(result).toEqual([
      { text: '  ', characterCount: 2, isRest: true }
    ])
  })

  it('伸ばし棒を含む音を正しく解析する', () => {
    const result = parseTextToSegments('トゥーーー')
    expect(result).toEqual([
      { text: 'トゥーーー', characterCount: 5, isRest: false }
    ])
  })

  it('複雑なパターンを解析できる', () => {
    const result = parseTextToSegments('ドゥン ドゥン タッタ  ドゥーン')
    expect(result).toEqual([
      { text: 'ドゥン', characterCount: 3, isRest: false },
      { text: ' ', characterCount: 1, isRest: true },
      { text: 'ドゥン', characterCount: 3, isRest: false },
      { text: ' ', characterCount: 1, isRest: true },
      { text: 'タッタ', characterCount: 3, isRest: false },
      { text: '  ', characterCount: 2, isRest: true },
      { text: 'ドゥーン', characterCount: 4, isRest: false }
    ])
  })
})
