import { useState, useCallback, useEffect } from 'react'
import { useHabitStore } from '@/store/useHabitStore'
import { useBetStore } from '@/store/useBetStore'
import { useAppStore } from '@/store/useAppStore'
import { DualArcSlider } from '@/components/ui/DualArcSlider'
import { PanelHeader, ActionBtn } from '@/components/ui/PanelPrimitives'
import type { Habit } from '@/lib/types'

// ─── Overlay (rendered from App) ──────────────────────────────────────────────

export function HabitCardOverlay() {
  const { cardItem, closeCard } = useAppStore()
  const { habits } = useHabitStore()
  const id = cardItem?.type === 'habit' ? cardItem.id : null
  const habit = id ? habits.find(h => h.id === id) : null
  if (!habit) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(4,8,14,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) closeCard() }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: 880,
          maxHeight: '92vh',
          background: '#070c14',
          boxShadow: '0 0 80px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <HabitCard habitId={habit.id} onClose={closeCard} />
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDue(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  if (diff <= 0) return 'DUE NOW'
  const h = Math.floor(diff / 3_600_000)
  if (h < 24) return `in ${h}h`
  return `in ${Math.floor(h / 24)}d`
}

const RECURRENCE_PRESETS = [
  { label: 'Daily',       hours: 24  },
  { label: '2×/week',     hours: 84  },
  { label: 'Weekly',      hours: 168 },
]

// ─── HabitCard ────────────────────────────────────────────────────────────────

interface HabitCardProps {
  habitId: string
  onClose: () => void
}

function HabitCard({ habitId, onClose }: HabitCardProps) {
  const { habits, updateHabit, completeHabit, deleteHabit } = useHabitStore()
  const { bets } = useBetStore()

  const habit = habits.find(h => h.id === habitId)

  const [title, setTitle]       = useState(habit?.title ?? '')
  const [certainty, setCertainty] = useState(habit?.certainty ?? 0.5)
  const [impact, setImpact]     = useState(habit?.intrinsic_impact ?? 0.5)
  const [notes, setNotes]       = useState((habit as any)?.notes ?? '')
  const [parentId, setParentId] = useState(habit?.parent_id ?? '')
  const [recurrence, setRecurrence] = useState(habit?.recurrence_hours ?? 24)
  const [customHours, setCustomHours] = useState(habit?.recurrence_hours ?? 24)

  useEffect(() => {
    if (!habit) return
    setTitle(habit.title)
    setCertainty(habit.certainty ?? 0.5)
    setImpact(habit.intrinsic_impact ?? 0.5)
    setParentId(habit.parent_id ?? '')
    setRecurrence(habit.recurrence_hours)
    setCustomHours(habit.recurrence_hours)
  }, [habitId]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback((patch: Partial<Habit>) => updateHabit(habitId, patch), [habitId, updateHabit])

  if (!habit) return null

  const isDue = new Date(habit.next_due_at) <= new Date()
  const activeBets = bets.filter(b => b.status === 'active' || b.status === 'paused')
  const parentBet = bets.find(b => b.id === parentId)

  function handleCertaintyChange(v: number) { setCertainty(v); save({ certainty: v }) }
  function handleImpactChange(v: number)    { setImpact(v);    save({ intrinsic_impact: v }) }
  function handleParentChange(id: string)   { setParentId(id); save({ parent_id: id || undefined }) }
  function handleRecurrenceChange(h: number) {
    setRecurrence(h)
    if (h > 0) { setCustomHours(h); save({ recurrence_hours: h }) }
  }
  function handleCustomHours(h: number) {
    setCustomHours(h)
    setRecurrence(0)
    if (h > 0) save({ recurrence_hours: h })
  }

  const isProactive = habit.type === 'proactive'

  return (
    <div className="flex flex-col" style={{ height: '92vh', maxHeight: '92vh' }}>

      {/* ── Zone 1: Header ──────────────────────────────────────────────── */}
      <PanelHeader
        type="habit"
        title={title}
        badge={habit.type.toUpperCase()}
        editableTitle
        onTitleChange={setTitle}
        onTitleBlur={() => save({ title: title.trim() || habit.title })}
        onClose={onClose}
        left={
          <span
            className="font-mono text-[11px]"
            style={{ color: isDue ? 'rgba(74,184,184,0.9)' : 'rgba(255,255,255,0.35)' }}
          >
            {formatDue(habit.next_due_at)}
          </span>
        }
      />

      {/* ── Zone 2: Context row ─────────────────────────────────────────── */}
      <div
        className="shrink-0 flex gap-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Left: sliders (only for proactive habits) */}
        <div
          className="flex items-center justify-center px-5 py-4"
          style={{ borderRight: '1px solid rgba(255,255,255,0.06)', minWidth: 200 }}
        >
          {isProactive ? (
            <DualArcSlider
              certainty={certainty}
              impact={impact}
              onCertaintyChange={handleCertaintyChange}
              onImpactChange={handleImpactChange}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <span className="font-mono text-4xl" style={{ color: 'rgba(74,184,184,0.3)' }}>↻</span>
              <span className="font-mono text-[10px] tracking-widest" style={{ color: 'rgba(74,184,184,0.4)' }}>
                MAINTENANCE
              </span>
            </div>
          )}
        </div>

        {/* Middle: parent + recurrence */}
        <div className="flex-1 flex flex-col justify-center px-6 py-4 gap-3 min-w-0">

          {/* Type toggle */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] tracking-widest shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>TYPE</span>
            <div className="flex gap-1">
              {(['proactive', 'maintenance'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => save({ type: t })}
                  className="px-2 py-0.5 font-mono text-[10px] tracking-widest border transition-colors"
                  style={{
                    color: habit.type === t ? 'rgba(74,184,184,0.9)' : 'rgba(255,255,255,0.25)',
                    borderColor: habit.type === t ? 'rgba(74,184,184,0.35)' : 'rgba(255,255,255,0.08)',
                    background: habit.type === t ? 'rgba(74,184,184,0.07)' : 'transparent',
                  }}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Parent bet */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] tracking-widest shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
              PARENT
            </span>
            <select
              value={parentId}
              onChange={e => handleParentChange(e.target.value)}
              className="flex-1 bg-transparent font-mono text-xs outline-none cursor-pointer"
              style={{ color: parentId ? 'rgba(232,160,69,0.8)' : 'rgba(255,255,255,0.2)', border: 'none', appearance: 'none' }}
            >
              <option value="" style={{ background: '#0d1822', color: 'rgba(255,255,255,0.4)' }}>— No parent —</option>
              {activeBets.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#0d1822', color: '#e8a045' }}>{b.title}</option>
              ))}
            </select>
          </div>

          {/* Recurrence */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[9px] tracking-widest shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>EVERY</span>
            {RECURRENCE_PRESETS.map(p => (
              <button
                key={p.hours}
                onClick={() => handleRecurrenceChange(p.hours)}
                className="px-2 py-0.5 font-mono text-[10px] border transition-colors"
                style={{
                  color: recurrence === p.hours ? 'rgba(74,184,184,0.9)' : 'rgba(255,255,255,0.25)',
                  borderColor: recurrence === p.hours ? 'rgba(74,184,184,0.35)' : 'rgba(255,255,255,0.08)',
                  background: recurrence === p.hours ? 'rgba(74,184,184,0.07)' : 'transparent',
                }}
              >
                {p.label}
              </button>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                value={customHours}
                onChange={e => handleCustomHours(parseInt(e.target.value) || 24)}
                className="bg-transparent outline-none font-mono text-xs w-12 text-center"
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '1px 4px',
                }}
              />
              <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>h</span>
            </div>
          </div>
        </div>

        {/* Right: stats */}
        <div
          className="flex flex-col items-center justify-center px-6 py-4 shrink-0"
          style={{ minWidth: 156, borderLeft: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="px-3 py-1.5 font-mono text-xs tracking-widest mb-3 text-center"
            style={{
              color: isDue ? 'rgba(74,184,184,0.9)' : 'rgba(255,255,255,0.35)',
              border: `1px solid ${isDue ? 'rgba(74,184,184,0.3)' : 'rgba(255,255,255,0.08)'}`,
              background: isDue ? 'rgba(74,184,184,0.08)' : 'transparent',
            }}
          >
            {isDue ? '● DUE NOW' : formatDue(habit.next_due_at)}
          </div>

          <div className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
            STATUS
          </div>
          <div className="font-mono text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {habit.status.toUpperCase()}
          </div>

          {habit.last_completed_at && (
            <>
              <div className="font-mono text-[9px] tracking-widest mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
                LAST DONE
              </div>
              <div className="font-mono text-[10px] mt-1 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {new Date(habit.last_completed_at).toLocaleDateString()}
              </div>
            </>
          )}

          {parentBet && isProactive && (
            <div className="mt-3 font-mono text-[10px] tabular-nums text-center" style={{ color: 'rgba(232,160,69,0.45)' }}>
              C {Math.round(certainty * 100)}% · I {Math.round(impact * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* ── Zone 3: Working area ─────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left: Notes */}
        <div className="flex-1 flex flex-col min-h-0 relative" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="absolute top-4 left-6" style={{ pointerEvents: 'none' }}>
            <span className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>NOTES</span>
          </div>
          <textarea
            className="flex-1 w-full bg-transparent resize-none outline-none font-mono text-xs"
            style={{ padding: '32px 24px 24px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, caretColor: '#4ab8b8' }}
            placeholder="Observations, what helps, what gets in the way..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={() => { /* notes not in Habit schema yet */ }}
            spellCheck={false}
          />
        </div>

        {/* Right: schedule info + actions */}
        <div className="shrink-0 flex flex-col px-5 pt-5 pb-4 gap-3" style={{ width: 172 }}>

          <div className="font-mono text-[10px] tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            SCHEDULE
          </div>
          <div>
            <div className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>RECURRENCE</div>
            <div className="font-mono text-xs mt-1" style={{ color: 'rgba(74,184,184,0.7)' }}>
              every {habit.recurrence_hours}h
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>NEXT DUE</div>
            <div className="font-mono text-xs mt-1" style={{ color: isDue ? 'rgba(74,184,184,0.9)' : 'rgba(255,255,255,0.4)' }}>
              {formatDue(habit.next_due_at)}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-1">
            <div className="font-mono text-[10px] tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
              ACTIONS
            </div>
            {habit.status !== 'paused'
              ? <ActionBtn label="PAUSE" onClick={() => save({ status: 'paused' })} />
              : <ActionBtn label="RESUME" onClick={() => save({ status: 'active' })} highlight />
            }
            <ActionBtn
              label="DELETE"
              onClick={() => { if (confirm(`Delete "${habit.title}"?`)) { deleteHabit(habitId); onClose() } }}
              danger
            />
          </div>
        </div>
      </div>

      {/* ── Footer CTA ──────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {isDue ? (
          <button
            onClick={() => completeHabit(habitId)}
            className="w-full py-3 font-mono text-xs tracking-widest transition-all"
            style={{
              background: 'rgba(74,184,184,0.1)',
              border: '1px solid rgba(74,184,184,0.45)',
              color: '#4ab8b8',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,184,184,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,184,184,0.1)' }}
          >
            ✓ MARK DONE
          </button>
        ) : (
          <div
            className="w-full py-3 text-center font-mono text-xs tracking-widest"
            style={{ color: 'rgba(74,184,184,0.3)', border: '1px solid rgba(74,184,184,0.1)' }}
          >
            ↻ {formatDue(habit.next_due_at).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}
