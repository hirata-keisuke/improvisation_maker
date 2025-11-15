import { useState } from 'react'
import { RhythmInput } from './ui/RhythmInput'
import { StaffView } from './ui/StaffView'
import { RhythmNote } from './types/rhythm'
import { parseTextToSegments } from './logic/textParser'
import { quantizeSegmentsToNotes } from './logic/quantizer'

function App() {
  const [notes, setNotes] = useState<RhythmNote[]>([])

  const handleRhythmSubmit = (text: string) => {
    console.log('Input text:', text)
    const segments = parseTextToSegments(text)
    console.log('Parsed segments:', segments)
    const rhythmNotes = quantizeSegmentsToNotes(segments)
    console.log('Quantized notes:', rhythmNotes)
    setNotes(rhythmNotes)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>アドリブメーカー</h1>
      <RhythmInput onSubmit={handleRhythmSubmit} />
      <div style={{ marginTop: '40px' }}>
        <StaffView notes={notes} />
      </div>
    </div>
  )
}

export default App
