import { useState, useCallback, useEffect } from 'react'
import { useBetStore } from '@/store/useBetStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useAppStore } from '@/store/useAppStore'
import { computeCumulativeScore, computeChessRank, computeTaskCumulativeScore } from '@/lib/scoring'
import { DualArcSlider } from '@/components/ui/DualArcSlider'
import { PanelHeader, PanelSection, ActionBtn } from '@/components/ui/PanelPrimitives'
import type { Bet, Task } from '@/lib/types'

// ─── Overlay (rendered from App) ──────────────────────────────────────────────

export function BetCardOverlay() {
  const { cardItem, closeCard } = useAppStore()
  const { bets } = useBetStore()
  const id = cardItem?.type === 'bet' ? cardItem.id : null
  const bet = id ? bets.find(b => b.id === id) : null
  if (!bet) return null

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
        <BetCard betId={bet.id} onClose={closeCard} />
      </div>
    </div>
  )
}

// ─── BetCard ──────────────────────────────────────────────────────────────────

interface BetCardProps {
  betId: string
  onClose: () => void
}

function BetCard({ betId, onClose }: BetCardProps) {
  const { bets, updateBet, deleteBet, lockBet, unlockBet } = useBetStore()
  const { tasks } = useTaskStore()
  const { openCard } = useAppStore()

  const bet = bets.find(b => b.id === betId)

  const [title, setTitle]           = useState(bet?.title ?? '')
  const [reward, setReward]         = useState(bet?.reward ?? '')
  const [consequence, setConsequence] = useState(bet?.consequence ?? '')
  const [certainty, setCertainty]   = useState(bet?.certainty ?? 0.5)
  const [impact, setImpact]         = useState(bet?.intrinsic_impact ?? 0.5)
  const [notes, setNotes]           = useState((bet as any)?.notes ?? '')
  const [parentBetId, setParentBetId] = useState(bet?.parent_bet_id ?? '')

  // Sync if bet changes externally
  useEffect(() => {
    if (!bet) return
    setTitle(bet.title)
    setReward(bet.reward ?? '')
    setConsequence(bet.consequence ?? '')
    setCertainty(bet.certainty)
    setImpact(bet.intrinsic_impact)
    setParentBetId(bet.parent_bet_id ?? '')
  }, [betId]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback((patch: Partial<Bet>) => updateBet(betId, patch), [betId, updateBet])

  if (!bet) return null

  const score    = computeCumulativeScore(bet, bets)
  const rank     = computeChessRank(bet, bets)
  const parentBet = bets.find(b => b.id === parentBetId)
  const childBets = bets.filter(b => b.parent_bet_id === betId)
  const childTasks: Task[] = tasks.filter(t => t.bet_id === betId)
  const otherBets = bets.filter(b => b.id !== betId && b.status !== 'killed' && b.status !== 'completed')

  function handleCertaintyChange(v: number) { setCertainty(v); save({ certainty: v }) }
  function handleImpactChange(v: number) { setImpact(v); save({ intrinsic_impact: v }) }
  function handleParentChange(id: string) { setParentBetId(id); save({ parent_bet_id: id || undefined }) }

  return (
    <div className="flex flex-col" style={{ height: '92vh', maxHeight: '92vh' }}>

      {/* ── Zone 1: Header ──────────────────────────────────────────────── */}
      <PanelHeader
        type="bet"
        title={title}
        badge={`${rank} BET`}
        editableTitle
        onTitleChange={setTitle}
        onTitleBlur={() => save({ title: title.trim() || bet.title })}
        onClose={onClose}
        left={
          <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {score.toFixed(4)}
          </span>
        }
      />

      {/* ── Zone 2: Context row ─────────────────────────────────────────── */}
      <div
        className="shrink-0 flex gap-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Left: sliders */}
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

        {/* Middle: parent bet + reward + consequence */}
        <div className="flex-1 flex flex-col justify-center px-6 py-4 gap-3 min-w-0">

          {/* Parent bet */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] tracking-widest shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
              PARENT
            </span>
            <select
              value={parentBetId}
              onChange={e => handleParentChange(e.target.value)}
              className="flex-1 bg-transparent font-mono text-xs outline-none cursor-pointer"
              style={{ color: parentBetId ? 'rgba(232,160,69,0.8)' : 'rgba(255,255,255,0.2)', border: 'none', appearance: 'none' }}
            >
              <option value="" style={{ background: '#0d1822', color: 'rgba(255,255,255,0.4)' }}>— Root goal (♚ King) —</option>
              {otherBets.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#0d1822', color: '#e8a045' }}>{b.title}</option>
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
              onBlur={() => save({ reward: reward.trim() || '' })}
              placeholder="Reward if achieved..."
              className="flex-1 bg-transparent resize-none outline-none font-mono text-xs"
              style={{ color: 'rgba(255,255,255,0.65)', caretColor: '#e8a045', lineHeight: 1.5 }}
              spellCheck={false}
            />
          </div>

          {/* Consequence */}
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-sm" style={{ marginTop: 1 }}>✊</span>
            <textarea
              rows={1}
              value={consequence}
              onChange={e => setConsequence(e.target.value)}
              onBlur={() => save({ consequence: consequence.trim() || undefined })}
              placeholder="Cost if abandoned..."
              className="flex-1 bg-transparent resize-none outline-none font-mono text-xs"
              style={{ color: 'rgba(255,255,255,0.5)', caretColor: '#e05555', lineHeight: 1.5 }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: score + status */}
        <div
          className="flex flex-col items-center justify-center px-6 py-4 shrink-0"
          style={{ minWidth: 156, borderLeft: '1px solid rgba(255,255,255,0.06)' }}
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
            {parentBet && (
              <div className="font-mono text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.25)' }}>
                × {computeCumulativeScore(parentBet, bets).toFixed(3)} parent
              </div>
            )}
          </div>
          <div
            className="mt-3 font-mono text-[10px] px-2 py-0.5"
            style={{
              color: bet.status === 'active' ? '#e8a045' : 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              background: bet.status === 'active' ? 'rgba(232,160,69,0.06)' : 'transparent',
            }}
          >
            {bet.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── Zone 3: Working area ─────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left: sub-bets + child tasks */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Child bets */}
          {childBets.length > 0 && (
            <PanelSection label="SUB-GOALS">
              <div className="flex flex-col gap-1">
                {childBets.map(child => (
                  <button
                    key={child.id}
                    onClick={() => openCard('bet', child.id)}
                    className="flex items-center gap-2 text-left px-2 py-1.5 transition-colors"
                    style={{ color: 'rgba(232,160,69,0.7)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {computeChessRank(child, bets)}
                    </span>
                    <span className="font-mono text-xs flex-1 truncate">{child.title}</span>
                    <span className="font-mono text-[10px]" style={{ color: 'rgba(232,160,69,0.4)' }}>
                      {computeCumulativeScore(child, bets).toFixed(3)} ↗
                    </span>
                  </button>
                ))}
              </div>
            </PanelSection>
          )}

          {/* Child tasks */}
          {childTasks.length > 0 && (
            <PanelSection label={`TASKS  (${childTasks.length})`}>
              <div className="flex flex-col gap-1">
                {childTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => openCard('task', task.id)}
                    className="flex items-center gap-2 text-left px-2 py-1.5 transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="font-mono text-[10px] w-16 shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {task.status.toUpperCase()}
                    </span>
                    <span className="font-mono text-xs flex-1 truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      {task.title}
                    </span>
                    <span className="font-mono text-[10px] shrink-0" style={{ color: 'rgba(232,160,69,0.45)' }}>
                      {computeTaskCumulativeScore(task, bets).toFixed(2)} ↗
                    </span>
                  </button>
                ))}
              </div>
            </PanelSection>
          )}

          {/* Notes */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="absolute top-4 left-6" style={{ pointerEvents: 'none' }}>
              <span className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.15)' }}>NOTES</span>
            </div>
            <textarea
              className="flex-1 w-full bg-transparent resize-none outline-none font-mono text-xs"
              style={{ padding: '32px 24px 24px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, caretColor: '#e8a045' }}
              placeholder="Thinking, context, open questions..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={() => { /* notes not in Bet schema yet */ }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right: actions panel */}
        <div className="shrink-0 flex flex-col px-5 pt-5 pb-4 gap-2" style={{ width: 172 }}>
          <div className="font-mono text-[10px] tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>ACTIONS</div>
          {bet.status === 'active' && (
            <ActionBtn label="PAUSE" onClick={() => save({ status: 'paused' })} />
          )}
          {bet.status === 'paused' && (
            <ActionBtn label="RESUME" onClick={() => save({ status: 'active', last_active_at: new Date().toISOString() })} highlight />
          )}
          {!bet.locked
            ? <ActionBtn label="LOCK" onClick={() => lockBet(betId)} />
            : <ActionBtn label="UNLOCK" onClick={() => unlockBet(betId)} highlight />
          }
          <ActionBtn label="ARCHIVE" onClick={() => { save({ status: 'completed' }); onClose() }} />
          <ActionBtn
            label="DELETE"
            onClick={() => { if (confirm(`Delete "${bet.title}"?`)) { deleteBet(betId); onClose() } }}
            danger
          />
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="w-full py-3 text-center font-mono text-xs tracking-widest"
          style={{
            color: 'rgba(232,160,69,0.45)',
            border: '1px solid rgba(232,160,69,0.12)',
          }}
        >
          {rank} PRIORITY {score.toFixed(4)}
        </div>
      </div>
    </div>
  )
}
