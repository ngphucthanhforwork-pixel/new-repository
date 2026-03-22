import { useEffect, useRef, useState } from 'react'
import { BattlefieldMinimap } from '@/components/plan/battlefield/BattlefieldMinimap'
import { useTaskStore } from '@/store/useTaskStore'
import { useAppStore } from '@/store/useAppStore'
import { BetForm } from './BetForm'
import { TaskForm } from './TaskForm'
import { HabitForm } from './HabitForm'
import { AreaForm } from './AreaForm'

type EntityType = 'bet' | 'task' | 'habit' | 'area'

const TYPES: {
  id: EntityType
  label: string
  icon: string
  shortcut: string
  color: string
  activeStyle: React.CSSProperties
}[] = [
  { id: 'bet',   label: 'BET',   icon: '♚', shortcut: '1', color: '#e8a045',
    activeStyle: { color: '#e8a045', borderColor: 'rgba(232,160,69,0.5)', background: 'rgba(232,160,69,0.07)' } },
  { id: 'task',  label: 'TASK',  icon: '◈', shortcut: '2', color: 'rgba(255,255,255,0.7)',
    activeStyle: { color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)' } },
  { id: 'habit', label: 'HABIT', icon: '↻', shortcut: '3', color: '#4ab8b8',
    activeStyle: { color: '#4ab8b8', borderColor: 'rgba(74,184,184,0.4)', background: 'rgba(74,184,184,0.06)' } },
  { id: 'area',  label: 'AREA',  icon: '▦', shortcut: '4', color: 'rgba(255,255,255,0.35)',
    activeStyle: { color: 'rgba(255,255,255,0.45)', borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' } },
]

const GHOST_LINES = [
  "What are you betting on?",
  "What happens if you don't?",
]

export function CaptureView() {
  const [text, setText] = useState('')
  const [activeType, setActiveType] = useState<EntityType | null>(null)
  // formKey forces a new form instance (with fresh initialTitle) when switching type
  const [formKey, setFormKey] = useState(0)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addTask } = useTaskStore()
  const { openTaskCard } = useAppStore()

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const isEmpty = text.length === 0

  // ── Keyboard shortcuts: Alt+1/2/3/4 to switch type ───────────────────────
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!e.altKey) return
      const idx = ['1', '2', '3', '4'].indexOf(e.key)
      if (idx === -1) return
      e.preventDefault()
      const t = TYPES[idx].id
      setActiveType(prev => prev === t ? null : t)
      setFormKey(k => k + 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function selectType(t: EntityType) {
    setActiveType(prev => {
      if (prev === t) return null
      return t
    })
    setFormKey(k => k + 1)
  }

  // Quick-capture for task (existing behaviour)
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

  function onFormDone() {
    setText('')
    setActiveType(null)
  }

  const initialTitle = text.trim()

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

        {/* Bottom status bar */}
        <div
          className="shrink-0 flex items-center justify-between px-16 py-3 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.04)' }}
        >
          <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
            {isEmpty ? 'braindump freely' : `${wordCount} word${wordCount !== 1 ? 's' : ''}`}
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

      {/* ── Right: Type switcher + form ────────────────────────────────────── */}
      <div
        className="w-72 flex flex-col shrink-0 border-l"
        style={{ background: '#07101a', borderColor: 'rgba(255,255,255,0.06)' }}
      >

        {/* Type tab strip */}
        <div
          className="shrink-0 grid grid-cols-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {TYPES.map(t => {
            const active = activeType === t.id
            return (
              <button
                key={t.id}
                onClick={() => selectType(t.id)}
                className="flex flex-col items-center py-2.5 px-1 transition-all font-mono"
                style={active ? {
                  ...t.activeStyle,
                  borderBottom: `2px solid ${t.color}`,
                } : {
                  color: 'rgba(255,255,255,0.2)',
                  borderBottom: '2px solid transparent',
                }}
                title={`${t.label} (Alt+${t.shortcut})`}
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>{t.icon}</span>
                <span className="text-[9px] tracking-widest mt-1">{t.label}</span>
                <span
                  className="text-[8px] mt-0.5 font-mono"
                  style={{ opacity: 0.35, color: active ? t.color : 'rgba(255,255,255,0.4)' }}
                >
                  Alt+{t.shortcut}
                </span>
              </button>
            )
          })}
        </div>

        {/* Form area or minimap */}
        {activeType ? (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {activeType === 'bet'   && <BetForm   key={formKey} onDone={onFormDone} initialTitle={initialTitle} />}
            {activeType === 'task'  && <TaskForm  key={formKey} onDone={onFormDone} initialTitle={initialTitle} />}
            {activeType === 'habit' && <HabitForm key={formKey} onDone={onFormDone} initialTitle={initialTitle} />}
            {activeType === 'area'  && <AreaForm  key={formKey} onDone={onFormDone} />}
          </div>
        ) : (
          <>
            {/* Minimap */}
            <div className="flex-1 overflow-hidden">
              <BattlefieldMinimap />
            </div>

            {/* Quick capture */}
            <div
              className="shrink-0 p-4 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <p
                className="text-center font-mono mb-3"
                style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.12em' }}
              >
                PICK A TYPE ABOVE · OR QUICK-CAPTURE BELOW
              </p>
              <button
                onClick={quickCapture}
                className="w-full py-3 font-mono text-xs tracking-widest border transition-colors"
                style={{
                  borderColor: 'rgba(232,160,69,0.4)',
                  color: '#e8a045',
                  background: 'rgba(232,160,69,0.04)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,160,69,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,160,69,0.04)' }}
              >
                CAPTURE AS TASK →
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
          </>
        )}
      </div>
    </div>
  )
}
