import { useEffect, useRef } from 'react'
import { RhythmNote } from '@/types/rhythm'
import { renderStaff } from '@/logic/staffRenderer'

interface StaffViewProps {
  notes: RhythmNote[]
}

export function StaffView({ notes }: StaffViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && notes.length > 0) {
      containerRef.current.innerHTML = ''
      renderStaff(containerRef.current, notes)
    }
  }, [notes])

  if (notes.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#999',
        border: '2px dashed #ddd',
        borderRadius: '8px',
      }}>
        リズムを入力すると、ここに五線譜が表示されます
      </div>
    )
  }

  return <div ref={containerRef} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
}
