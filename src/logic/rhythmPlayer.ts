import { Measure } from '@/types/rhythm'

export class RhythmPlayer {
  private audioContext: AudioContext | null = null
  private scheduledSources: OscillatorNode[] = []

  constructor() {
    this.audioContext = new AudioContext()
  }

  play(measures: Measure[], tempo: number): void {
    this.stop()

    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }

    const beatDuration = 60 / tempo
    let currentTime = this.audioContext.currentTime + 0.1

    measures.forEach((measure) => {
      measure.notes.forEach((note) => {
        if (!note.isRest) {
          const startTime = currentTime + note.startBeat * beatDuration
          const duration = Math.min(note.durationBeats * beatDuration, 0.2)
          this.scheduleNote(startTime, duration)
        }
      })
      currentTime += measure.beatsPerMeasure * beatDuration
    })
  }

  private scheduleNote(time: number, duration: number): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = 880
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0, time)
    gainNode.gain.linearRampToValueAtTime(0.3, time + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration)

    oscillator.start(time)
    oscillator.stop(time + duration)

    this.scheduledSources.push(oscillator)
  }

  stop(): void {
    this.scheduledSources.forEach((source) => {
      try {
        source.stop()
      } catch (e) {
      }
    })
    this.scheduledSources = []
  }

  async close(): Promise<void> {
    this.stop()
    if (this.audioContext) {
      await this.audioContext.close()
      this.audioContext = null
    }
  }
}
