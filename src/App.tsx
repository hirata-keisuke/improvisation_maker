import { useState, useRef, useEffect } from 'react'
import { ToolPalette } from './ui/ToolPalette'
import { InteractiveStaff } from './ui/InteractiveStaff'
import { NoteTemplate, RhythmNote, Score } from './types/rhythm'
import { RhythmPlayer } from './logic/rhythmPlayer'
import { exportToPDF } from './logic/pdfExporter'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

function App() {
  const [score, setScore] = useState<Score>({
    id: generateId(),
    title: 'New Rhythm',
    tempo: 120,
    measures: [
      {
        id: generateId(),
        timeSignature: { numerator: 4, denominator: 4 },
        notes: [],
        beatsPerMeasure: 4,
      },
    ],
  })

  const [selectedTool, setSelectedTool] = useState<NoteTemplate | null>({
    type: 'quarter',
    durationBeats: 1,
    isRest: false,
  })

  const [isPlaying, setIsPlaying] = useState(false)
  const playerRef = useRef<RhythmPlayer>(new RhythmPlayer())

  useEffect(() => {
    return () => {
      playerRef.current.close()
    }
  }, [])

  const handleAddNote = (measureIndex: number, beat: number) => {
    if (!selectedTool) return

    const newNote: RhythmNote = {
      id: generateId(),
      startBeat: beat,
      durationBeats: selectedTool.durationBeats,
      isRest: selectedTool.isRest,
    }

    setScore((prev) => {
      const measure = prev.measures[measureIndex]
      const currentTotalBeats = measure.notes.reduce((sum, n) => sum + n.durationBeats, 0)
      const newTotalBeats = currentTotalBeats + newNote.durationBeats

      // 小節の拍数を超える場合は追加しない
      if (newTotalBeats > measure.beatsPerMeasure) {
        console.warn(`小節 ${measureIndex} が満杯です: ${newTotalBeats} > ${measure.beatsPerMeasure}`)
        alert(`この音符を追加すると小節の拍数（${measure.beatsPerMeasure}拍）を超えてしまいます。`)
        return prev
      }

      const newMeasures = [...prev.measures]
      newMeasures[measureIndex] = {
        ...newMeasures[measureIndex],
        notes: [...newMeasures[measureIndex].notes, newNote],
      }
      return { ...prev, measures: newMeasures }
    })
  }

  const handleDeleteNote = (noteId: string) => {
    setScore((prev) => ({
      ...prev,
      measures: prev.measures.map((measure) => ({
        ...measure,
        notes: measure.notes.filter((note) => note.id !== noteId),
      })),
    }))
  }

  const handleMoveNote = (noteId: string, targetMeasureIndex: number, targetBeat: number) => {
    setScore((prev) => {
      // 元のノートを見つけて削除
      let movedNote: RhythmNote | null = null
      const measuresWithoutNote = prev.measures.map((measure) => {
        const foundNote = measure.notes.find((n) => n.id === noteId)
        if (foundNote) {
          movedNote = foundNote
          return {
            ...measure,
            notes: measure.notes.filter((n) => n.id !== noteId),
          }
        }
        return measure
      })

      if (!movedNote) return prev

      // ターゲット小節に追加
      const targetMeasure = measuresWithoutNote[targetMeasureIndex]
      const currentTotalBeats = targetMeasure.notes.reduce((sum, n) => sum + n.durationBeats, 0)
      const newTotalBeats = currentTotalBeats + (movedNote as RhythmNote).durationBeats

      if (newTotalBeats > targetMeasure.beatsPerMeasure) {
        alert(`この音符を移動すると小節の拍数（${targetMeasure.beatsPerMeasure}拍）を超えてしまいます。`)
        return prev
      }

      const updatedNote: RhythmNote = { ...(movedNote as RhythmNote), startBeat: targetBeat }
      const newMeasures = [...measuresWithoutNote]
      newMeasures[targetMeasureIndex] = {
        ...targetMeasure,
        notes: [...targetMeasure.notes, updatedNote],
      }

      return { ...prev, measures: newMeasures }
    })
  }

  const handleAddMeasure = () => {
    setScore((prev) => ({
      ...prev,
      measures: [
        ...prev.measures,
        {
          id: generateId(),
          timeSignature: { numerator: 4, denominator: 4 },
          notes: [],
          beatsPerMeasure: 4,
        },
      ],
    }))
  }

  const handlePlay = () => {
    if (isPlaying) {
      playerRef.current.stop()
      setIsPlaying(false)
    } else {
      playerRef.current.play(score.measures, score.tempo)
      setIsPlaying(true)
      setTimeout(() => setIsPlaying(false), calculateTotalDuration())
    }
  }

  const calculateTotalDuration = () => {
    const totalBeats = score.measures.reduce((sum, m) => sum + m.beatsPerMeasure, 0)
    return (totalBeats / score.tempo) * 60 * 1000
  }

  const handleExportPDF = async () => {
    await exportToPDF(score)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>アドリブメーカー</h1>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label htmlFor="title" style={{ fontWeight: 'bold' }}>タイトル:</label>
          <input
            id="title"
            type="text"
            value={score.title}
            onChange={(e) => setScore({ ...score, title: e.target.value })}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              minWidth: '200px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label htmlFor="bpm" style={{ fontWeight: 'bold' }}>BPM:</label>
          <input
            id="bpm"
            type="number"
            value={score.tempo}
            onChange={(e) => setScore({ ...score, tempo: Number(e.target.value) })}
            min="40"
            max="240"
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              width: '80px',
            }}
          />
        </div>

        <button
          onClick={handlePlay}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isPlaying ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {isPlaying ? '⏹ 停止' : '▶ 再生'}
        </button>

        <button
          onClick={handleExportPDF}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          📄 PDF出力
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        <ToolPalette selectedTool={selectedTool} onSelectTool={setSelectedTool} />
        <InteractiveStaff
          measures={score.measures}
          selectedTool={selectedTool}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onMoveNote={handleMoveNote}
          onAddMeasure={handleAddMeasure}
        />
      </div>
    </div>
  )
}

export default App
