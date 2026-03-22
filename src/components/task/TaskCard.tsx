import { useState, useEffect, useCallback } from 'react'
import { useTaskStore } from '@/store/useTaskStore'
import { useBetStore } from '@/store/useBetStore'
import { useAppStore } from '@/store/useAppStore'
import { computeTaskCumulativeScore, computeCumulativeScore } from '@/lib/scoring'
import { DualArcSlider } from '@/components/ui/DualArcSlider'

// ─── Overlay wrapper (rendered from App.tsx) ─────────────────────────────────

export function TaskCardOverlay() {
  const { taskCardId, closeTaskCard } = useAppStore()
  if (!taskCardId) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(4,8,14,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) closeTaskCard() }}
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
        <TaskCard taskId={taskCardId} onClose={closeTaskCard} />
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
  const { setMode, setActiveTask } = useAppStore()

  const task = tasks.find(t => t.id === taskId)

  // Local state for editable fields
  const [title, setTitle] = useState(task?.title ?? '')
  const [certainty, setCertainty] = useState(task?.certainty ?? 0.5)
  const [impact, setImpact] = useState(task?.intrinsic_impact ?? 0.5)
  const [objectives, setObjectives] = useState<string[]>(task?.objectives ?? [''])
  const [estTime, setEstTime] = useState(task?.estimated_time ?? 30)
  const [notes, setNotes] = useState(task?.notes ?? '')

  // Sync local state if task changes externally
  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setCertainty(task.certainty)
    setImpact(task.intrinsic_impact)
    setObjectives(task.objectives.length ? task.objectives : [''])
    setEstTime(task.estimated_time)
    setNotes(task.notes ?? '')
  }, [taskId]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback((patch: Parameters<typeof updateTask>[1]) => {
    updateTask(taskId, patch)
  }, [taskId, updateTask])

  if (!task) return null

  const parentBet = bets.find(b => b.id === task.bet_id)
  const score = computeTaskCumulativeScore(task, bets)
  const parentScore = parentBet ? computeCumulativeScore(parentBet, bets) : null

  // Breadcrumb
  const crumbs: string[] = []
  if (parentBet) {
    const grandparent = bets.find(b => b.id === parentBet.parent_bet_id)
    if (grandparent) crumbs.push(grandparent.title)
    crumbs.push(parentBet.title)
  }

  function startMission() {
    save({ status: 'active', queued_at: new Date().toISOString() })
    setActiveTask(taskId)
    setMode('execute')
    onClose()
  }

  function handleCertaintyChange(v: number) {
    setCertainty(v)
    save({ certainty: v })
  }

  function handleImpactChange(v: number) {
    setImpact(v)
    save({ intrinsic_impact: v })
  }

  function updateObjective(i: number, val: string) {
    const next = objectives.map((o, idx) => idx === i ? val : o)
    setObjectives(next)
    save({ objectives: next.filter(o => o.trim()) })
  }

  function removeObjective(i: number) {
    const next = objectives.filter((_, idx) => idx !== i)
    const final = next.length ? next : ['']
    setObjectives(final)
    save({ objectives: final.filter(o => o.trim()) })
  }

  function addObjective() {
    setObjectives(prev => [...prev, ''])
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ height: '92vh', maxHeight: '92vh' }}>

      {/* ── Zone 1: Title Strip ─────────────────────────────────────────── */}
      <div
        className="shrink-0 flex flex-col"
        style={{ background: '#c47a1a' }}
      >
        {/* Breadcrumb + back + badge row */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className="font-mono text-[11px] shrink-0 transition-opacity hover:opacity-70"
              style={{ color: 'rgba(0,0,0,0.55)' }}
            >
              ← BACK
            </button>
            {crumbs.length > 0 && (
              <>
                <span style={{ color: 'rgba(0,0,0,0.3)', fontSize: 11 }}>·</span>
                <span
                  className="font-mono text-[11px] truncate"
                  style={{ color: 'rgba(0,0,0,0.45)' }}
                >
                  {crumbs.join(' › ')}
                </span>
              </>
            )}
          </div>
          <span
            className="shrink-0 font-mono text-[10px] tracking-widest px-2 py-0.5"
            style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(0,0,0,0.6)' }}
          >
            {task.bet_id ? 'MISSION' : 'SIDE TASK'}
          </span>
        </div>
        {/* Editable title */}
        <input
          className="w-full bg-transparent outline-none font-mono font-semibold px-5 pb-3"
          style={{ fontSize: 22, color: 'rgba(0,0,0,0.88)', caretColor: 'rgba(0,0,0,0.6)' }}
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

        {/* Middle: Why context */}
        <div className="flex-1 flex flex-col justify-center px-6 py-4 gap-3 min-w-0">
          {parentBet?.reward && (
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] tracking-widest shrink-0 mt-0.5" style={{ color: '#e8a045' }}>REWARD</span>
              <span className="font-mono text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {parentBet.reward}
              </span>
            </div>
          )}
          {parentBet?.consequence && (
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] tracking-widest shrink-0 mt-0.5" style={{ color: '#e05555' }}>IF NOT</span>
              <span className="font-mono text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {parentBet.consequence}
              </span>
            </div>
          )}
          {parentBet && (
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 11, color: 'rgba(232,160,69,0.4)' }}>⬦</span>
              <span className="font-mono text-[11px] truncate" style={{ color: 'rgba(232,160,69,0.5)' }}>
                {parentBet.title}
              </span>
            </div>
          )}
          {!parentBet && (
            <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              No bet assigned — parked task
            </span>
          )}
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

          {/* Objectives */}
          <div className="shrink-0 px-6 pt-5 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="font-mono text-[10px] tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              OBJECTIVES
            </div>
            <div className="flex flex-col gap-2">
              {objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <span className="font-mono text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.15)' }}>□</span>
                  <input
                    className="flex-1 bg-transparent outline-none font-mono text-xs"
                    style={{ color: 'rgba(255,255,255,0.7)', caretColor: '#e8a045' }}
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
              ))}
              <button
                onClick={addObjective}
                className="text-left font-mono text-[11px] transition-opacity"
                style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 16 }}
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

          {/* Status badge */}
          <div className="mt-auto">
            <div
              className="font-mono text-[10px] tracking-widest px-2 py-1 text-center"
              style={{
                color: task.status === 'completed'
                  ? 'rgba(74,184,176,0.7)'
                  : task.status === 'active'
                  ? '#e8a045'
                  : 'rgba(255,255,255,0.2)',
                border: `1px solid ${task.status === 'completed' ? 'rgba(74,184,176,0.2)' : task.status === 'active' ? 'rgba(232,160,69,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {task.status.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA: Start Mission ───────────────────────────────────────────── */}
      <div
        className="shrink-0 px-6 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {task.status !== 'completed' ? (
          <button
            onClick={startMission}
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
            → START MISSION
          </button>
        ) : (
          <div
            className="w-full py-3 text-center font-mono text-xs tracking-widest"
            style={{ color: 'rgba(74,184,176,0.6)', border: '1px solid rgba(74,184,176,0.15)' }}
          >
            ✓ MISSION COMPLETE
          </div>
        )}
      </div>
    </div>
  )
}
