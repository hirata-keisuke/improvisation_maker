import { ParsedSegment, RhythmNote } from '@/types/rhythm'

const SIXTEENTH_NOTE = 0.25

export function quantizeSegmentsToNotes(segments: ParsedSegment[]): RhythmNote[] {
  const notes: RhythmNote[] = []
  let currentBeat = 0

  for (const segment of segments) {
    const durationBeats = segment.characterCount * SIXTEENTH_NOTE

    notes.push({
      id: generateId(),
      startBeat: currentBeat,
      durationBeats,
      isRest: segment.isRest,
    })

    currentBeat += durationBeats
  }

  return notes
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}
