import { ParsedSegment } from '@/types/rhythm'

const SMALL_KANA = ['ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ャ', 'ュ', 'ョ', 'ヮ', 'ッ', 'ヵ', 'ヶ']
const CONTINUATION_CHARS = ['ー', 'ン']

function isContinuationChar(char: string): boolean {
  return SMALL_KANA.includes(char) || CONTINUATION_CHARS.includes(char)
}

export function parseTextToSegments(text: string): ParsedSegment[] {
  if (text.length === 0) {
    return []
  }

  const segments: ParsedSegment[] = []
  let currentSegment = ''
  let isCurrentRest = text[0] === ' '
  let expectFollowingChar = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const isSpace = char === ' '

    if (isSpace) {
      if (isCurrentRest) {
        currentSegment += char
      } else {
        if (currentSegment.length > 0) {
          segments.push({
            text: currentSegment,
            characterCount: currentSegment.length,
            isRest: false,
          })
        }
        currentSegment = char
        isCurrentRest = true
        expectFollowingChar = false
      }
    } else {
      if (isCurrentRest) {
        if (currentSegment.length > 0) {
          segments.push({
            text: currentSegment,
            characterCount: currentSegment.length,
            isRest: true,
          })
        }
        currentSegment = char
        isCurrentRest = false
        expectFollowingChar = char === 'ッ'
      } else {
        if (expectFollowingChar || isContinuationChar(char)) {
          currentSegment += char
          expectFollowingChar = char === 'ッ'
        } else {
          if (currentSegment.length > 0) {
            segments.push({
              text: currentSegment,
              characterCount: currentSegment.length,
              isRest: false,
            })
          }
          currentSegment = char
          expectFollowingChar = char === 'ッ'
        }
      }
    }
  }

  if (currentSegment.length > 0) {
    segments.push({
      text: currentSegment,
      characterCount: currentSegment.length,
      isRest: isCurrentRest,
    })
  }

  return segments
}
