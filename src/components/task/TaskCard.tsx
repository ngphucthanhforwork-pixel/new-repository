import { useState, useEffect, useCallback } from 'react'
import { useTaskStore } from '@/store/useTaskStore'
import { useBetStore } from '@/store/useBetStore'
import { useAppStore } from '@/store/useAppStore'
import { computeTaskCumulativeScore, computeCumulativeScore } from '@/lib/scoring'
import { DualArcSlider } from '@/components/ui/DualArcSlider'
import type { Task } from '@/lib/types'

// ─── Date helpers (ISO ↔ dd/mm/yy) ──────────────────────────────────────────

function isoToDisplay(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y.slice(2)}`
}

function displayToIso(display: string): string {
  const parts = display.trim().split('/')
  if (parts.length !== 3) return ''
  const [d, m, y] = parts
  if (!d || !m || !y) return ''
  const year = y.length === 2 ? '20' + y : y
  if (isNaN(Number(d)) || isNaN(Number(m)) || isNaN(Number(year))) return ''
  return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

// ─── Status config ────────────────────────────────────────────────────────────

type TaskStatus = Task['status']

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string; bg: string }[] = [
  { value: 'backlog',    label: 'BACKLOG',    color: 'rgba(255,255,255,0.3)',  bg: 'rgba(255,255,255,0.04)' },
  { value: 'locked',    label: 'LOCKED',     color: 'rgba(160,140,255,0.7)',  bg: 'rgba(160,140,255,0.08)' },
  { value: 'queued',    label: 'QUEUED',     color: 'rgba(232,160,69,0.7)',   bg: 'rgba(232,160,69,0.08)'  },
  { value: 'scheduled', label: 'SCHEDULED',  color: 'rgba(74,184,200,0.7)',   bg: 'rgba(74,184,200,0.08)'  },
  { value: 'executing', label: 'EXECUTING',  color: '#e8a045',                bg: 'rgba(232,160,69,0.14)'  },
  { value: 'done',      label: 'DONE',       color: 'rgba(74,184,176,0.8)',   bg: 'rgba(74,184,176,0.1)'   },
]

// ─── Overlay wrapper (rendered from App.tsx) ─────────────────────────────────

export function TaskCardOverlay() {
  const { cardItem, closeCard } = useAppStore()
  const taskCardId = cardItem?.type === 'task' ? cardItem.id : null
  if (!taskCardId) return null

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
        <TaskCard taskId={taskCardId} onClose={closeCard} />
      </div>
    </div>
  )
}

// ─── TaskCard ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  taskId: string
  onClose: () => void
}

function TaskCard({ taskId, onClose }: TaskCardProps) {
  const { tasks, updateTask } = useTaskStore()
  const { bets } = useBetStore()

  const task = tasks.find(t => t.id === taskId)

  // Local state for editable fields
  const [title, setTitle] = useState(task?.title ?? '')
  const [certainty, setCertainty] = useState(task?.certainty ?? 0.5)
  const [impact, setImpact] = useState(task?.intrinsic_impact ?? 0.5)
  const [objectives, setObjectives] = useState<string[]>(task?.objectives ?? [''])
  const [objDone, setObjDone] = useState<boolean[]>(task?.objectives_done ?? [])
  const [estTime, setEstTime] = useState(task?.estimated_time ?? 30)
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [reward, setReward] = useState(task?.reward ?? '')
  const [consequence, setConsequence] = useState(task?.consequence ?? '')
  const [betId, setBetId] = useState(task?.bet_id ?? '')
  const [startDate, setStartDate] = useState(() => isoToDisplay(task?.start_date ?? ''))
  const [dueDate, setDueDate] = useState(() => isoToDisplay(task?.due_date ?? ''))
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'backlog')

  // Sync local state if task changes externally
  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setCertainty(task.certainty)
    setImpact(task.intrinsic_impact)
    setObjectives(task.objectives.length ? task.objectives : [''])
    setObjDone(task.objectives_done ?? [])
    setEstTime(task.estimated_time)
    setNotes(task.notes ?? '')
    setReward(task.reward ?? '')
    setConsequence(task.consequence ?? '')
    setBetId(task.bet_id ?? '')
    setStartDate(isoToDisplay(task.start_date ?? ''))
    setDueDate(isoToDisplay(task.due_date ?? ''))
    setStatus(task.status)
  }, [taskId]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback((patch: Parameters<typeof updateTask>[1]) => {
    updateTask(taskId, patch)
  }, [taskId, updateTask])

  if (!task) return null

  const parentBet = bets.find(b => b.id === betId)
  const score = computeTaskCumulativeScore({ ...task, bet_id: betId || undefined }, bets)
  const parentScore = parentBet ? computeCumulativeScore(parentBet, bets) : null

  function saveToBacklog() {
    save({ unprocessed: false, status: 'backlog' })
    setStatus('backlog')
    onClose()
  }

  function handleStatusChange(s: TaskStatus) {
    setStatus(s)
    save({ status: s })
  }

  function handleCertaintyChange(v: number) {
    setCertainty(v)
    save({ certainty: v })
  }

  function handleImpactChange(v: number) {
    setImpact(v)
    save({ intrinsic_impact: v })
  }

  function handleBetChange(id: string) {
    setBetId(id)
    save({ bet_id: id || undefined })
  }

  function toggleObjDone(i: number) {
    const next = [...objDone]
    next[i] = !next[i]
    setObjDone(next)
    save({ objectives_done: next })
  }

  function updateObjective(i: number, val: string) {
    const next = objectives.map((o, idx) => idx === i ? val : o)
    setObjectives(next)
    save({ objectives: next.filter(o => o.trim()) })
  }

  function removeObjective(i: number) {
    const next = objectives.filter((_, idx) => idx !== i)
    const nextDone = objDone.filter((_, idx) => idx !== i)
    const final = next.length ? next : ['']
    const finalDone = next.length ? nextDone : []
    setObjectives(final)
    setObjDone(finalDone)
    save({ objectives: final.filter(o => o.trim()), objectives_done: finalDone })
  }

  function addObjective() {
    setObjectives(prev => [...prev, ''])
    setObjDone(prev => [...prev, false])
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ height: '92vh', maxHeight: '92vh' }}>

      {/* ── Zone 1: Title Strip ─────────────────────────────────────────── */}
      <div
        className="shrink-0 flex flex-col"
        style={{ background: '#c47a1a' }}
      >
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <button
            onClick={onClose}
            className="font-mono text-[11px] shrink-0 transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            ← BACK
          </button>
          <span
            className="shrink-0 font-mono text-[10px] tracking-widest px-2 py-0.5"
            style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)' }}
          >
            {betId ? 'MISSION' : 'SIDE TASK'}
          </span>
        </div>
        {/* Editable title — white */}
        <input
          className="w-full bg-transparent outline-none font-mono font-semibold px-5 pb-3"
          style={{ fontSize: 22, color: '#ffffff', caretColor: 'rgba(255,255,255,0.6)' }}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() => save({ title: title.trim() || task.title })}
          placeholder="Task title..."
        />
      </div>

      {/* ── Zone 2: Context Row ─────────────────────────────────────────── */}
      <div
        className="shrink-0 flex gap-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Left: Dual arc sliders */}
        <div
          className="flex items-center justify-center px-5 py-4"
          style={{ borderRight: '1px solid rgba(255,255,255,0.06)', minWidth: 200 }}
        >
          <DualArcSlider
            certainty={certainty}
            impact={impact}
            onCertaintyChange={handleCertaintyChange}
            onImpactChange={handleImpactChange}
          />
        </div>

        {/* Middle: Bet selector + Reward / Consequence */}
        <div className="flex-1 flex flex-col justify-center px-6 py-4 gap-3 min-w-0">

          {/* Parent bet selector */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] tracking-widest shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
              BET
            </span>
            <select
              value={betId}
              onChange={e => handleBetChange(e.target.value)}
              className="flex-1 bg-transparent font-mono text-xs outline-none cursor-pointer"
              style={{
                color: betId ? 'rgba(232,160,69,0.8)' : 'rgba(255,255,255,0.2)',
                border: 'none',
                appearance: 'none',
              }}
            >
              <option value="" style={{ background: '#0d1822', color: 'rgba(255,255,255,0.4)' }}>
                — No parent bet —
              </option>
              {bets.filter(b => b.status === 'active').map(b => (
                <option key={b.id} value={b.id} style={{ background: '#0d1822', color: '#e8a045' }}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          {/* Reward */}
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-sm" style={{ marginTop: 1 }}>🏆</span>
            <textarea
              rows={1}
              value={reward}
              onChange={e => setReward(e.target.value)}
              onBlur={() => save({ reward: reward.trim() || undefined })}
              placeholder="Reward if done..."
              className="flex-1 bg-transparent resize-none outline-none font-mono text-xs"
              style={{ color: 'rgba(255,255,255,0.65)', caretColor: '#e8a045', lineHeight: 1.5 }}
              spellCheck={false}
            />
          </div>

          {/* Consequence */}
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-sm" style={{ marginTop: 1 }}>👊</span>
            <textarea
              rows={1}
              value={consequence}
              onChange={e => setConsequence(e.target.value)}
              onBlur={() => save({ consequence: consequence.trim() || undefined })}
              placeholder="Cost if skipped..."
              className="flex-1 bg-transparent resize-none outline-none font-mono text-xs"
              style={{ color: 'rgba(255,255,255,0.5)', caretColor: '#e05555', lineHeight: 1.5 }}
              spellCheck={false}
            />
          </div>

          {/* Dates — dd/mm/yy text inputs */}
          <div className="flex items-center gap-4 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] tracking-widest shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>START</span>
              <input
                type="text"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                onBlur={() => {
                  const iso = displayToIso(startDate)
                  if (iso) { save({ start_date: iso }) }
                  else if (!startDate) { save({ start_date: undefined }) }
                }}
                placeholder="dd/mm/yy"
                maxLength={8}
                className="bg-transparent outline-none font-mono text-xs w-16"
                style={{ color: startDate ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.18)', caretColor: '#e8a045' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] tracking-widest shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>DUE</span>
              <input
                type="text"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                onBlur={() => {
                  const iso = displayToIso(dueDate)
                  if (iso) { save({ due_date: iso }) }
                  else if (!dueDate) { save({ due_date: undefined }) }
                }}
                placeholder="dd/mm/yy"
                maxLength={8}
                className="bg-transparent outline-none font-mono text-xs w-16"
                style={{ color: dueDate ? 'rgba(232,160,69,0.7)' : 'rgba(255,255,255,0.18)', caretColor: '#e8a045' }}
              />
            </div>
          </div>
        </div>

        {/* Right: Priority Score */}
        <div
          className="flex flex-col items-center justify-center px-6 py-4 shrink-0"
          style={{
            minWidth: 156,
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="font-mono text-[9px] tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            PRIORITY
          </div>
          <div className="font-mono font-semibold tabular-nums" style={{ fontSize: 28, color: '#e8a045', lineHeight: 1 }}>
            {score.toFixed(3)}
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <div className="font-mono text-[10px] tabular-nums" style={{ color: 'rgba(232,160,69,0.55)' }}>
              C {Math.round(certainty * 100)}% · I {Math.round(impact * 100)}%
            </div>
            {parentScore !== null && (
              <div className="font-mono text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.25)' }}>
                × {parentScore.toFixed(3)} parent
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Zone 3: Working Area ────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left: Objectives + Notepad */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Objectives — checklist */}
          <div className="shrink-0 px-6 pt-5 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="font-mono text-[10px] tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              OBJECTIVES
            </div>
            <div className="flex flex-col gap-2">
              {objectives.map((obj, i) => {
                const done = objDone[i] ?? false
                return (
                  <div key={i} className="flex items-center gap-2 group">
                    {/* Checkbox toggle */}
                    <button
                      onClick={() => toggleObjDone(i)}
                      className="shrink-0 w-4 h-4 flex items-center justify-center transition-colors"
                      style={{
                        border: `1px solid ${done ? '#4ab8b0' : 'rgba(255,255,255,0.2)'}`,
                        background: done ? 'rgba(74,184,176,0.15)' : 'transparent',
                        color: done ? '#4ab8b0' : 'transparent',
                        fontSize: 10,
                        lineHeight: 1,
                      }}
                    >
                      ✓
                    </button>
                    <input
                      className="flex-1 bg-transparent outline-none font-mono text-xs transition-all"
                      style={{
                        color: done ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
                        textDecoration: done ? 'line-through' : 'none',
                        caretColor: '#e8a045',
                      }}
                      placeholder={`Objective ${i + 1}`}
                      value={obj}
                      onChange={e => updateObjective(i, e.target.value)}
                    />
                    {objectives.length > 1 && (
                      <button
                        onClick={() => removeObjective(i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xs"
                        style={{ color: 'rgba(255,255,255,0.2)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )
              })}
              <button
                onClick={addObjective}
                className="text-left font-mono text-[11px] transition-opacity"
                style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 24 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(232,160,69,0.6)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
              >
                + ADD OBJECTIVE
              </button>
            </div>
          </div>

          {/* Notepad */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="absolute top-4 left-6" style={{ pointerEvents: 'none' }}>
              <span className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>
                NOTES
              </span>
            </div>
            <textarea
              className="flex-1 w-full bg-transparent resize-none outline-none font-mono text-xs"
              style={{
                padding: '32px 24px 24px',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.9,
                caretColor: '#e8a045',
              }}
              placeholder="Start. Don't think. Just write."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={() => save({ notes })}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: Time estimate */}
        <div className="shrink-0 flex flex-col px-6 pt-5 pb-4" style={{ width: 172 }}>
          <div className="font-mono text-[10px] tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            ESTIMATED TIME
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              step={5}
              className="bg-transparent outline-none font-mono text-2xl font-semibold tabular-nums"
              style={{
                width: 72,
                color: 'rgba(255,255,255,0.8)',
                caretColor: '#e8a045',
                border: 'none',
              }}
              value={estTime}
              onChange={e => {
                const v = parseInt(e.target.value) || 5
                setEstTime(v)
                save({ estimated_time: v })
              }}
            />
            <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>min</span>
          </div>

          {/* Quick time presets */}
          <div className="flex flex-col gap-1.5 mt-4">
            {[15, 25, 45, 90].map(t => (
              <button
                key={t}
                onClick={() => { setEstTime(t); save({ estimated_time: t }) }}
                className="text-left font-mono text-[11px] px-2 py-1 transition-colors"
                style={{
                  color: estTime === t ? '#e8a045' : 'rgba(255,255,255,0.2)',
                  background: estTime === t ? 'rgba(232,160,69,0.08)' : 'transparent',
                  border: `1px solid ${estTime === t ? 'rgba(232,160,69,0.25)' : 'rgba(255,255,255,0.05)'}`,
                }}
                onMouseEnter={e => { if (estTime !== t) e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
                onMouseLeave={e => { if (estTime !== t) e.currentTarget.style.color = 'rgba(255,255,255,0.2)' }}
              >
                {t}m
              </button>
            ))}
          </div>

          {/* Status selector */}
          <div className="mt-auto flex flex-col gap-1">
            <div className="font-mono text-[9px] tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              STATUS
            </div>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className="text-left font-mono text-[10px] tracking-widest px-2 py-1 transition-all"
                style={{
                  color: status === opt.value ? opt.color : 'rgba(255,255,255,0.18)',
                  background: status === opt.value ? opt.bg : 'transparent',
                  border: `1px solid ${status === opt.value ? opt.color.replace(')', ',0.3)').replace('rgba(', 'rgba(') : 'rgba(255,255,255,0.04)'}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA: Save to Battlefield ─────────────────────────────────── */}
      <div
        className="shrink-0 px-6 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {task.status === 'done' ? (
          <div
            className="w-full py-3 text-center font-mono text-xs tracking-widest"
            style={{ color: 'rgba(74,184,176,0.6)', border: '1px solid rgba(74,184,176,0.15)' }}
          >
            ✓ MISSION COMPLETE
          </div>
        ) : (
          <button
            onClick={saveToBacklog}
            className="w-full py-3 font-mono text-xs tracking-widest transition-all"
            style={{
              background: 'rgba(232,160,69,0.1)',
              border: '1px solid rgba(232,160,69,0.4)',
              color: '#e8a045',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(232,160,69,0.2)'
              e.currentTarget.style.borderColor = 'rgba(232,160,69,0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(232,160,69,0.1)'
              e.currentTarget.style.borderColor = 'rgba(232,160,69,0.4)'
            }}
          >
            → SAVE TO BATTLEFIELD
          </button>
        )}
      </div>
    </div>
  )
}
