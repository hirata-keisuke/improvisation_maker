export interface RhythmNote {
  id: string
  startBeat: number
  durationBeats: number
  isRest: boolean
}

export interface TimeSignature {
  numerator: number
  denominator: number
}

export interface Measure {
  id: string
  timeSignature: TimeSignature
  chord?: string
  notes: RhythmNote[]
  beatsPerMeasure: number
}

export interface RhythmSequence {
  tempo: number
  measures: Measure[]
}

export interface Score {
  id: string
  title: string
  tempo: number
  measures: Measure[]
}

export type NoteValue = 1 | 2 | 4 | 8 | 16 | 32

export type NoteType = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth'

export interface NoteTemplate {
  type: NoteType
  durationBeats: number
  isRest: boolean
}

export interface ParsedSegment {
  text: string
  characterCount: number
  isRest: boolean
}
