import { RhythmNote } from '@/types/rhythm'
import Vex from 'vexflow'

const { Renderer, Stave, StaveNote, Voice, Formatter } = Vex.Flow

function beatsToVexDuration(beats: number): string {
  if (beats >= 4) return 'w'
  if (beats >= 2) return 'h'
  if (beats >= 1) return 'q'
  if (beats >= 0.5) return '8'
  return '16'
}

function beatsToNoteDuration(beats: number): { duration: string; dots: number } {
  const wholeDurations: Record<number, { duration: string; dots: number }> = {
    4: { duration: 'w', dots: 0 },
    6: { duration: 'h', dots: 1 },
    3: { duration: 'h', dots: 0 },
    2: { duration: 'h', dots: 0 },
    1.5: { duration: 'q', dots: 1 },
    1: { duration: 'q', dots: 0 },
    0.75: { duration: '8', dots: 1 },
    0.5: { duration: '8', dots: 0 },
    0.375: { duration: '16', dots: 1 },
    0.25: { duration: '16', dots: 0 },
  }

  return wholeDurations[beats] || { duration: '16', dots: 0 }
}

export function renderStaff(container: HTMLElement, notes: RhythmNote[]): void {
  console.log('renderStaff called with notes:', notes)
  const width = Math.max(800, container.clientWidth)
  const height = 200

  try {
    const renderer = new Renderer(container, Renderer.Backends.SVG)
    renderer.resize(width, height)
    const context = renderer.getContext()
    console.log('Renderer created successfully')

    const stave = new Stave(10, 40, width - 20)
    stave.addClef('percussion')
    stave.addTimeSignature('4/4')
    stave.setContext(context).draw()

    const vexNotes: StaveNote[] = notes.map((note) => {
      const { duration, dots } = beatsToNoteDuration(note.durationBeats)

      const durationString = note.isRest ? `${duration}r` : duration
      const durationWithDots = dots > 0 ? `${durationString}d` : durationString

      const vexNote = new StaveNote({
        keys: ['b/4'],
        duration: durationWithDots,
        clef: 'percussion',
      })

      return vexNote
    })

    console.log('Created vexNotes:', vexNotes.length)

    if (vexNotes.length > 0) {
      const voice = new Voice({ num_beats: 16, beat_value: 4 })
      voice.setStrict(false)
      voice.addTickables(vexNotes)

      new Formatter().joinVoices([voice]).format([voice], width - 100)

      voice.draw(context, stave)
      console.log('Staff rendered successfully')
    }
  } catch (error) {
    console.error('Error rendering staff:', error)
  }
}
