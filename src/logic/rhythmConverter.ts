import { RhythmNote } from '@/types/rhythm'

const SIXTEENTH_NOTE = 0.25

function timeToBeats(seconds: number, bpm: number): number {
  const beatsPerSecond = bpm / 60
  return seconds * beatsPerSecond
}

function quantizeToGrid(beats: number): number {
  return Math.round(beats / SIXTEENTH_NOTE) * SIXTEENTH_NOTE
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export function convertOnsetsToNotes(onsets: number[], bpm: number): RhythmNote[] {
  if (onsets.length === 0) {
    return []
  }

  const notes: RhythmNote[] = []

  for (let i = 0; i < onsets.length; i++) {
    const startTime = onsets[i]
    const nextTime = i < onsets.length - 1 ? onsets[i + 1] : startTime + 0.5

    const startBeat = quantizeToGrid(timeToBeats(startTime, bpm))
    const endBeat = quantizeToGrid(timeToBeats(nextTime, bpm))
    const durationBeats = Math.max(SIXTEENTH_NOTE, endBeat - startBeat)

    notes.push({
      id: generateId(),
      startBeat,
      durationBeats,
      isRest: false,
    })
  }

  return notes
}
