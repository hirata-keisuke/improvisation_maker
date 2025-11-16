import { useEffect, useRef } from 'react'
import { Measure, NoteTemplate } from '@/types/rhythm'
import { renderInteractiveStaff } from '@/logic/interactiveStaffRenderer'

interface InteractiveStaffProps {
  measures: Measure[]
  selectedTool: NoteTemplate | null
  onAddNote: (measureIndex: number, beat: number) => void
  onDeleteNote: (noteId: string) => void
  onMoveNote: (noteId: string, targetMeasureIndex: number, targetBeat: number) => void
  onAddMeasure: () => void
}

export function InteractiveStaff({
  measures,
  selectedTool,
  onAddNote,
  onDeleteNote,
  onMoveNote,
  onAddMeasure,
}: InteractiveStaffProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
      renderInteractiveStaff(
        containerRef.current,
        measures,
        selectedTool,
        onAddNote,
        onDeleteNote,
        onMoveNote
      )
    }
  }, [measures, selectedTool, onAddNote, onDeleteNote, onMoveNote])

  return (
    <div style={{ marginTop: '20px' }}>
      <div
        ref={containerRef}
        id="interactive-staff-container"
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '200px',
          overflowX: 'auto',
        }}
      />
      <div style={{ marginTop: '16px' }}>
        <button
          onClick={onAddMeasure}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          + 小節を追加
        </button>
      </div>
    </div>
  )
}
