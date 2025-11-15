import { useState } from 'react'
import { RhythmInput } from './ui/RhythmInput'
import { AudioRecorder } from './ui/AudioRecorder'
import { StaffView } from './ui/StaffView'
import { RhythmNote } from './types/rhythm'
import { parseTextToSegments } from './logic/textParser'
import { quantizeSegmentsToNotes } from './logic/quantizer'
import { detectOnsets, calculateDynamicThreshold } from './logic/onsetDetector'
import { convertOnsetsToNotes } from './logic/rhythmConverter'

function App() {
  const [notes, setNotes] = useState<RhythmNote[]>([])
  const [bpm, setBpm] = useState(120)
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('audio')

  const handleRhythmSubmit = (text: string) => {
    console.log('Input text:', text)
    const segments = parseTextToSegments(text)
    console.log('Parsed segments:', segments)
    const rhythmNotes = quantizeSegmentsToNotes(segments)
    console.log('Quantized notes:', rhythmNotes)
    setNotes(rhythmNotes)
  }

  const handleRecordingComplete = (audioBuffer: AudioBuffer) => {
    console.log('Audio buffer received:', audioBuffer.duration, 'seconds')
    const threshold = calculateDynamicThreshold(audioBuffer)
    console.log('Dynamic threshold:', threshold)
    const onsets = detectOnsets(audioBuffer, threshold)
    console.log('Detected onsets:', onsets)
    const rhythmNotes = convertOnsetsToNotes(onsets, bpm)
    console.log('Converted to notes:', rhythmNotes)
    setNotes(rhythmNotes)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>アドリブメーカー</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setInputMode('audio')}
            style={{
              padding: '8px 16px',
              backgroundColor: inputMode === 'audio' ? '#007bff' : '#e9ecef',
              color: inputMode === 'audio' ? 'white' : '#495057',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: inputMode === 'audio' ? 'bold' : 'normal',
            }}
          >
            録音入力
          </button>
          <button
            onClick={() => setInputMode('text')}
            style={{
              padding: '8px 16px',
              backgroundColor: inputMode === 'text' ? '#007bff' : '#e9ecef',
              color: inputMode === 'text' ? 'white' : '#495057',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: inputMode === 'text' ? 'bold' : 'normal',
            }}
          >
            テキスト入力
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label htmlFor="bpm" style={{ fontWeight: 'bold' }}>BPM:</label>
          <input
            id="bpm"
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
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
      </div>

      {inputMode === 'audio' ? (
        <AudioRecorder onRecordingComplete={handleRecordingComplete} />
      ) : (
        <RhythmInput onSubmit={handleRhythmSubmit} />
      )}

      <div style={{ marginTop: '40px' }}>
        <StaffView notes={notes} />
      </div>
    </div>
  )
}

export default App
