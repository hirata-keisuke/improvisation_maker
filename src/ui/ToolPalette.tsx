import { NoteTemplate, NoteType } from '@/types/rhythm'

interface ToolPaletteProps {
  selectedTool: NoteTemplate | null
  onSelectTool: (tool: NoteTemplate | null) => void
}

const NOTE_TEMPLATES: NoteTemplate[] = [
  { type: 'whole', durationBeats: 4, isRest: false },
  { type: 'half', durationBeats: 2, isRest: false },
  { type: 'quarter', durationBeats: 1, isRest: false },
  { type: 'eighth', durationBeats: 0.5, isRest: false },
  { type: 'sixteenth', durationBeats: 0.25, isRest: false },
]

const REST_TEMPLATES: NoteTemplate[] = [
  { type: 'whole', durationBeats: 4, isRest: true },
  { type: 'half', durationBeats: 2, isRest: true },
  { type: 'quarter', durationBeats: 1, isRest: true },
  { type: 'eighth', durationBeats: 0.5, isRest: true },
  { type: 'sixteenth', durationBeats: 0.25, isRest: true },
]

const NOTE_SYMBOLS: Record<NoteType, string> = {
  whole: '全',
  half: '二',
  quarter: '四',
  eighth: '八',
  sixteenth: '十六',
}

const NOTE_LABELS: Record<NoteType, string> = {
  whole: '全音符',
  half: '二分音符',
  quarter: '四分音符',
  eighth: '八分音符',
  sixteenth: '十六分音符',
}

export function ToolPalette({ selectedTool, onSelectTool }: ToolPaletteProps) {
  const isSelected = (template: NoteTemplate) => {
    return selectedTool?.type === template.type && selectedTool?.isRest === template.isRest
  }

  return (
    <div style={{
      padding: '16px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '2px solid #dee2e6',
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>ツールパレット</h3>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#495057' }}>音符</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {NOTE_TEMPLATES.map((template) => (
            <button
              key={template.type}
              onClick={() => onSelectTool(template)}
              title={NOTE_LABELS[template.type]}
              style={{
                padding: '12px 16px',
                fontSize: '16px',
                backgroundColor: isSelected(template) ? '#007bff' : 'white',
                color: isSelected(template) ? 'white' : '#212529',
                border: '2px solid #dee2e6',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '60px',
                fontWeight: 'bold',
              }}
            >
              {NOTE_SYMBOLS[template.type]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#495057' }}>休符</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {REST_TEMPLATES.map((template) => (
            <button
              key={`rest-${template.type}`}
              onClick={() => onSelectTool(template)}
              title={`${NOTE_LABELS[template.type]}休符`}
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                backgroundColor: isSelected(template) ? '#007bff' : 'white',
                color: isSelected(template) ? 'white' : '#495057',
                border: '2px solid #dee2e6',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '60px',
                fontWeight: 'bold',
              }}
            >
              {template.type === 'whole' && '全休'}
              {template.type === 'half' && '二休'}
              {template.type === 'quarter' && '四休'}
              {template.type === 'eighth' && '八休'}
              {template.type === 'sixteenth' && '十六休'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#495057' }}>操作</h4>
        <button
          onClick={() => onSelectTool(null)}
          title="ノートをクリックして削除"
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            backgroundColor: !selectedTool ? '#dc3545' : 'white',
            color: !selectedTool ? 'white' : '#dc3545',
            border: '2px solid #dc3545',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '100%',
            fontWeight: 'bold',
          }}
        >
          🗑 削除モード
        </button>
      </div>

      {selectedTool && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#e7f3ff',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#004085',
        }}>
          選択中: {selectedTool.isRest ? '休符 - ' : ''}{NOTE_LABELS[selectedTool.type]}
        </div>
      )}
      {!selectedTool && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#f8d7da',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#721c24',
        }}>
          削除モード: ノートをクリックして削除
        </div>
      )}
    </div>
  )
}
