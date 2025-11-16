import { Measure, NoteTemplate } from '@/types/rhythm'
import Vex from 'vexflow'

const { Renderer, Stave, StaveNote, Voice, Formatter, Beam } = Vex.Flow
type VexStaveNote = InstanceType<typeof StaveNote>

const MEASURE_WIDTH = 300
const GRID_RESOLUTION = 0.25

function quantizeToGrid(beat: number): number {
  return Math.round(beat / GRID_RESOLUTION) * GRID_RESOLUTION
}

function beatsToNoteDuration(beats: number): { duration: string; dots: number } {
  const durations: Record<number, { duration: string; dots: number }> = {
    4: { duration: 'w', dots: 0 },
    2: { duration: 'h', dots: 0 },
    1: { duration: 'q', dots: 0 },
    0.5: { duration: '8', dots: 0 },
    0.25: { duration: '16', dots: 0 },
  }
  return durations[beats] || { duration: '16', dots: 0 }
}

export function renderInteractiveStaff(
  container: HTMLElement,
  measures: Measure[],
  selectedTool: NoteTemplate | null,
  onAddNote: (measureIndex: number, beat: number) => void,
  onDeleteNote: (noteId: string) => void,
  onMoveNote: (noteId: string, targetMeasureIndex: number, targetBeat: number) => void
): void {
  const totalWidth = Math.max(800, MEASURE_WIDTH * measures.length + 40)
  const height = 200

  const renderer = new Renderer(container as HTMLDivElement, Renderer.Backends.SVG)
  renderer.resize(totalWidth, height)
  const context = renderer.getContext()

  const svgElement = container.querySelector('svg')
  if (!svgElement) return

  svgElement.style.cursor = selectedTool ? 'crosshair' : 'default'

  measures.forEach((measure, measureIndex) => {
    const x = 20 + measureIndex * MEASURE_WIDTH
    const stave = new Stave(x, 40, MEASURE_WIDTH - 20)

    if (measureIndex === 0) {
      stave.addClef('percussion')
    }
    stave.addTimeSignature(`${measure.timeSignature.numerator}/${measure.timeSignature.denominator}`)
    stave.setContext(context).draw()

    const vexNotes: VexStaveNote[] = []
    const noteToIdMap: Map<number, string> = new Map()
    const sortedNotes = [...measure.notes].sort((a, b) => a.startBeat - b.startBeat)

    let vexNoteIndex = 0

    // ノートのみを描画（ギャップの自動休符を追加しない）
    sortedNotes.forEach((note) => {
      const { duration } = beatsToNoteDuration(note.durationBeats)
      const durationString = note.isRest ? `${duration}r` : duration

      vexNotes.push(
        new StaveNote({
          keys: ['b/4'],
          duration: durationString,
          clef: 'percussion',
        })
      )

      noteToIdMap.set(vexNoteIndex, note.id)
      vexNoteIndex++
    })

    // 小節全体の拍数を満たすための休符を追加
    const totalBeats = sortedNotes.reduce((sum, note) => sum + note.durationBeats, 0)

    console.log(`Measure ${measureIndex}:`, {
      totalBeats,
      beatsPerMeasure: measure.beatsPerMeasure,
      noteCount: sortedNotes.length,
      notes: sortedNotes.map(n => ({ startBeat: n.startBeat, duration: n.durationBeats }))
    })

    if (totalBeats < measure.beatsPerMeasure) {
      const restDuration = measure.beatsPerMeasure - totalBeats
      const { duration } = beatsToNoteDuration(restDuration)
      vexNotes.push(
        new StaveNote({
          keys: ['b/4'],
          duration: `${duration}r`,
          clef: 'percussion',
        })
      )
    } else if (totalBeats > measure.beatsPerMeasure) {
      console.warn(`小節 ${measureIndex} が拍数を超えています: ${totalBeats} > ${measure.beatsPerMeasure}`)
    }

    if (vexNotes.length > 0) {
      const voice = new Voice({
        num_beats: measure.beatsPerMeasure,
        beat_value: measure.timeSignature.denominator,
      })
      // setStrict(false)を削除して正確な拍数管理を有効化
      voice.addTickables(vexNotes)

      new Formatter().joinVoices([voice]).format([voice], MEASURE_WIDTH - 40)
      voice.draw(context, stave)

      // 8分音符と16分音符に連桁を付ける
      const beamableNotes = vexNotes.filter(
        (note) => !note.isRest() && (note.getDuration().includes('8') || note.getDuration().includes('16'))
      )
      if (beamableNotes.length > 1) {
        const beams = Beam.generateBeams(beamableNotes)
        beams.forEach((beam) => beam.setContext(context).draw())
      }
    }

    const clickOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    clickOverlay.setAttribute('x', String(x))
    clickOverlay.setAttribute('y', '40')
    clickOverlay.setAttribute('width', String(MEASURE_WIDTH - 20))
    clickOverlay.setAttribute('height', '160')
    clickOverlay.setAttribute('fill', 'transparent')
    clickOverlay.style.cursor = selectedTool ? 'crosshair' : 'default'

    clickOverlay.addEventListener('click', (e) => {
      if (!selectedTool) return

      const svgRect = svgElement.getBoundingClientRect()
      const clickX = e.clientX - svgRect.left - x
      const relativeX = Math.max(0, Math.min(clickX, MEASURE_WIDTH - 20))
      const beatPosition = (relativeX / (MEASURE_WIDTH - 20)) * measure.beatsPerMeasure
      const quantizedBeat = quantizeToGrid(beatPosition)

      console.log('Click Debug:', {
        clientX: e.clientX,
        svgLeft: svgRect.left,
        measureX: x,
        clickX,
        relativeX,
        beatPosition,
        quantizedBeat,
      })

      if (quantizedBeat >= 0 && quantizedBeat < measure.beatsPerMeasure) {
        onAddNote(measureIndex, quantizedBeat)
      }
    })

    svgElement.appendChild(clickOverlay)

    vexNotes.forEach((vexNote, index) => {
      const noteId = noteToIdMap.get(index)
      if (noteId) {
        const noteSvgElement = vexNote.getSVGElement()
        if (noteSvgElement && noteSvgElement instanceof SVGGraphicsElement) {
          // SVG要素全体を包含する透明な領域を作成
          const bbox = noteSvgElement.getBBox()
          const clickableArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

          clickableArea.setAttribute('x', String(bbox.x - 5))
          clickableArea.setAttribute('y', String(bbox.y - 5))
          clickableArea.setAttribute('width', String(bbox.width + 10))
          clickableArea.setAttribute('height', String(bbox.height + 10))
          clickableArea.setAttribute('fill', 'transparent')
          clickableArea.style.cursor = 'pointer'
          clickableArea.setAttribute('data-note-id', noteId)

          // 削除モード時はクリックで削除
          clickableArea.addEventListener('click', (e: Event) => {
            if (!selectedTool) {
              e.stopPropagation()
              console.log('Note clicked (delete mode):', noteId)
              onDeleteNote(noteId)
            }
          })

          // マウスダウンでドラッグ開始（削除モードでない場合のみ）
          let isDragging = false
          let dragStartX = 0
          let dragStartY = 0

          clickableArea.addEventListener('mousedown', (e: MouseEvent) => {
            if (selectedTool) return // 追加モードではドラッグ無効

            isDragging = true
            dragStartX = e.clientX
            dragStartY = e.clientY
            clickableArea.style.opacity = '0.5'

            const handleMouseMove = (moveEvent: MouseEvent) => {
              if (!isDragging) return

              // ドラッグ距離が5px以上でドラッグと判定
              const distance = Math.sqrt(
                Math.pow(moveEvent.clientX - dragStartX, 2) +
                Math.pow(moveEvent.clientY - dragStartY, 2)
              )

              if (distance > 5) {
                clickableArea.style.stroke = '#007bff'
                clickableArea.style.strokeWidth = '3'
                clickableArea.style.strokeDasharray = '5,5'
              }
            }

            const handleMouseUp = (upEvent: MouseEvent) => {
              if (!isDragging) return

              isDragging = false
              clickableArea.style.opacity = '1'
              clickableArea.style.stroke = 'none'
              clickableArea.style.strokeDasharray = ''

              // ドロップ先を計算
              const svgRect = svgElement.getBoundingClientRect()
              const dropX = upEvent.clientX - svgRect.left

              // どの小節にドロップしたか判定
              let targetMeasureIndex = -1
              let targetBeat = 0

              measures.forEach((m, idx) => {
                const measureX = 20 + idx * MEASURE_WIDTH
                if (dropX >= measureX && dropX < measureX + (MEASURE_WIDTH - 20)) {
                  targetMeasureIndex = idx
                  const relativeX = dropX - measureX
                  const beatPosition = (relativeX / (MEASURE_WIDTH - 20)) * m.beatsPerMeasure
                  targetBeat = quantizeToGrid(beatPosition)
                }
              })

              if (targetMeasureIndex >= 0 && targetBeat >= 0) {
                console.log('Drop:', { noteId, targetMeasureIndex, targetBeat })
                onMoveNote(noteId, targetMeasureIndex, targetBeat)
              }

              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          })

          clickableArea.addEventListener('mouseenter', () => {
            ;(noteSvgElement as SVGElement).style.opacity = '0.6'
            clickableArea.style.stroke = '#dc3545'
            clickableArea.style.strokeWidth = '2'
          })

          clickableArea.addEventListener('mouseleave', () => {
            ;(noteSvgElement as SVGElement).style.opacity = '1'
            clickableArea.style.stroke = 'none'
          })

          // SVG要素の親に追加
          noteSvgElement.parentNode?.appendChild(clickableArea)
        }
      }
    })
  })
}
