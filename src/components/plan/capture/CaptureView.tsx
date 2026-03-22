import { useRef, useState } from 'react'
import { useTaskStore } from '@/store/useTaskStore'
import { useAppStore } from '@/store/useAppStore'
import { UnifiedCaptureForm } from './UnifiedCaptureForm'

const GHOST_LINES = [
  "What are you betting on?",
  "What happens if you don't?",
]

export function CaptureView() {
  const [text, setText] = useState('')
  // formKey resets the form (with fresh initialTitle) when the user clicks "send to form"
  const [formKey, setFormKey] = useState(0)
  const [sentTitle, setSentTitle] = useState('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addTask } = useTaskStore()
  const { openTaskCard } = useAppStore()

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const isEmpty = text.length === 0

  // Push current notepad text into the form as initialTitle
  function sendToForm() {
    setSentTitle(text.trim())
    setFormKey(k => k + 1)
  }

  function onFormDone() {
    setText('')
    setSentTitle('')
  }

  // Quick capture — create unprocessed task without going through the form
  function quickCapture() {
    const task = addTask({
      title: text.trim() || 'Untitled',
      objectives: [],
      estimated_time: 30,
      certainty: 0.5,
      intrinsic_impact: 0.5,
      status: 'backlog',
      unprocessed: true,
    })
    setText('')
    openTaskCard(task.id)
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: Notepad ─────────────────────────────────────────────────── */}
      <div
        className="relative flex-1 flex flex-col overflow-hidden"
        style={{ background: '#060a11' }}
        onClick={() => textareaRef.current?.focus()}
      >
        {/* Ghost prompt */}
        {isEmpty && (
          <div
            className="absolute pointer-events-none select-none"
            style={{ top: '15%', left: 0, right: 0, padding: '0 64px' }}
          >
            {GHOST_LINES.map((line, i) => (
              <p
                key={i}
                className="font-mono leading-loose"
                style={{
                  fontSize: 18,
                  color: `rgba(255,255,255,${i === 0 ? 0.06 : 0.035})`,
                  marginBottom: i === 0 ? 4 : 0,
                }}
              >
                {line}
              </p>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="flex-1 w-full bg-transparent resize-none outline-none font-mono text-white/80 leading-relaxed"
          style={{
            fontSize: 16,
            lineHeight: 1.9,
            padding: '12% 64px 40px',
            caretColor: '#e8a045',
          }}
          value={text}
          onChange={e => setText(e.target.value)}
          spellCheck={false}
          autoFocus
        />

        {/* Bottom bar */}
        <div
          className="shrink-0 flex items-center justify-between px-16 py-3 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.04)' }}
        >
          <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
            {isEmpty ? 'braindump freely' : `${wordCount} word${wordCount !== 1 ? 's' : ''}`}
          </span>
          <div className="flex items-center gap-4">
            {!isEmpty && (
              <>
                <button
                  onClick={sendToForm}
                  className="font-mono text-[10px] transition-colors"
                  style={{ color: 'rgba(232,160,69,0.5)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(232,160,69,0.85)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,160,69,0.5)')}
                  title="Copy notepad text into the form title"
                >
                  → form
                </button>
                <button
                  onClick={quickCapture}
                  className="font-mono text-[10px] transition-colors"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                  title="Capture as unprocessed task"
                >
                  quick capture
                </button>
                <button
                  onClick={() => setText('')}
                  className="font-mono text-[10px] transition-colors"
                  style={{ color: 'rgba(255,255,255,0.12)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.12)')}
                >
                  clear
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Unified form ────────────────────────────────────────────── */}
      <div
        className="w-72 shrink-0 border-l overflow-hidden flex flex-col"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <UnifiedCaptureForm
          key={formKey}
          initialTitle={sentTitle}
          onDone={onFormDone}
        />
      </div>
    </div>
  )
}
