import { useRef, useState } from 'react'
import { BattlefieldMinimap } from '@/components/plan/battlefield/BattlefieldMinimap'
import { useTaskStore } from '@/store/useTaskStore'
import { useAppStore } from '@/store/useAppStore'

const GHOST_LINES = [
  "What are you betting on?",
  "What happens if you don't?",
]

export function CaptureView() {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addTask } = useTaskStore()
  const { openTaskCard } = useAppStore()

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const isEmpty = text.length === 0

  function openCapture() {
    const task = addTask({
      title: text.trim() || 'Untitled',
      objectives: [],
      estimated_time: 30,
      certainty: 0.5,
      intrinsic_impact: 0.5,
      status: 'queued',
      unprocessed: true,
    })
    setText('')
    openTaskCard(task.id)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: Notepad ───────────────────────────────────────────── */}
      <div
        className="relative flex-1 flex flex-col overflow-hidden"
        style={{ background: '#060a11' }}
        onClick={() => textareaRef.current?.focus()}
      >
        {/* Ghost prompt — visible only when empty */}
        {isEmpty && (
          <div
            className="absolute pointer-events-none select-none"
            style={{
              top: '15%',
              left: 0,
              right: 0,
              padding: '0 64px',
            }}
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

        {/* Textarea */}
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

        {/* Bottom status bar */}
        <div
          className="shrink-0 flex items-center justify-between px-16 py-3 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.04)' }}
        >
          <span
            className="font-mono text-[10px] transition-opacity"
            style={{ color: 'rgba(255,255,255,0.18)' }}
          >
            {isEmpty
              ? 'braindump freely'
              : `${wordCount} word${wordCount !== 1 ? 's' : ''}`}
          </span>
          {!isEmpty && (
            <button
              onClick={() => setText('')}
              className="font-mono text-[10px] transition-colors"
              style={{ color: 'rgba(255,255,255,0.12)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.12)')}
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* ── Right: Minimap + Capture ─────────────────────────────────── */}
      <div
        className="w-64 flex flex-col shrink-0 border-l"
        style={{ background: '#07101a', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {/* Minimap */}
        <div className="flex-1 overflow-hidden">
          <BattlefieldMinimap />
        </div>

        {/* Capture button */}
        <div
          className="shrink-0 p-4 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={openCapture}
            className="w-full py-3 font-mono text-xs tracking-widest border transition-colors"
            style={{
              borderColor: 'rgba(232,160,69,0.4)',
              color: '#e8a045',
              background: 'rgba(232,160,69,0.04)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(232,160,69,0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(232,160,69,0.04)'
            }}
          >
            CAPTURE →
          </button>

          {!isEmpty && (
            <p
              className="text-center font-mono mt-2"
              style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)' }}
            >
              {wordCount}w ready to structure
            </p>
          )}
        </div>
      </div>

    </div>
  )
}
