import { useBattlefieldStore } from '@/store/useBattlefieldStore'
import { useBetStore } from '@/store/useBetStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useHabitStore } from '@/store/useHabitStore'
import { useCampaignStore } from '@/store/useCampaignStore'
import { useAppStore } from '@/store/useAppStore'
import { computeChessRank, computeCumulativeScore, computeTaskCumulativeScore } from '@/lib/scoring'
import { TaskView } from './TaskView'

export function MissionPanel() {
  const { panelOpen, selectedId, panelTaskId, deselect } = useBattlefieldStore()
  const { bets, updateBet, deleteBet, lockBet, unlockBet } = useBetStore()
  const { addToGrand } = useCampaignStore()
  const { openTaskCard } = useAppStore()
  const { tasks } = useTaskStore()
  const { habits, completeHabit } = useHabitStore()

  const bet = bets.find(b => b.id === selectedId)
  const habit = !bet ? habits.find(h => h.id === selectedId) : undefined

  const betTasks = bet ? tasks.filter(t => t.bet_id === bet.id) : []
  const rank = bet ? computeChessRank(bet, bets) : null
  const score = bet ? computeCumulativeScore(bet, bets) : null

  return (
    <>
      {/* Backdrop on mobile */}
      {panelOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={deselect} />
      )}

      {/* Panel */}
      <div
        data-panel
        className={`
          fixed top-0 right-0 h-full w-80 bg-surface border-l border-white/8
          z-40 flex flex-col transition-transform duration-250 ease-out
          ${panelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {panelTaskId ? (
          <TaskView />
        ) : bet ? (
          <BetPanel
            bet={bet}
            rank={rank!}
            score={score!}
            tasks={betTasks}
            allBets={bets}
            onClose={deselect}
            onUpdate={(data) => updateBet(bet.id, data)}
            onDelete={() => { deleteBet(bet.id); deselect() }}
            onOpenTask={openTaskCard}
            onLock={() => lockBet(bet.id)}
            onUnlock={() => unlockBet(bet.id)}
            onAddToQueue={() => { addToGrand(bet.id) }}
          />
        ) : habit ? (
          <HabitPanel habit={habit} onClose={deselect} onComplete={() => completeHabit(habit.id)} />
        ) : null}
      </div>
    </>
  )
}

// ─── Bet Panel ────────────────────────────────────────────────────────────────

import type { Bet, Task } from '@/lib/types'

interface BetPanelProps {
  bet: Bet
  rank: string
  score: number
  tasks: Task[]
  allBets: Bet[]
  onClose: () => void
  onUpdate: (data: Partial<Bet>) => void
  onDelete: () => void
  onOpenTask: (id: string) => void
  onLock: () => void
  onUnlock: () => void
  onAddToQueue: () => void
}

function BetPanel({ bet, rank, score, tasks, allBets, onClose, onUpdate, onDelete, onOpenTask, onLock, onUnlock, onAddToQueue }: BetPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Amber header strip */}
      <div style={{ background: '#c47a1a' }} className="flex items-center gap-2 px-4 py-3 shrink-0">
        <span className="text-lg">{rank}</span>
        <span className="text-xs font-mono text-black/80 font-medium flex-1 truncate tracking-wide">
          {bet.title}
        </span>
        <button onClick={onClose} className="text-black/50 hover:text-black/80 text-xs font-mono">✕</button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex flex-col" style={{ background: '#0d1520' }}>

        {/* PARENT GOAL selector */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="text-[10px] font-mono text-white/30 tracking-widest mb-2">PARENT GOAL</div>
          <select
            value={bet.parent_bet_id ?? ''}
            onChange={e => onUpdate({ parent_bet_id: e.target.value || undefined })}
            className="w-full bg-transparent font-mono text-xs outline-none cursor-pointer"
            style={{
              color: bet.parent_bet_id ? 'rgba(232,160,69,0.75)' : 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '5px 8px',
              appearance: 'none',
            }}
          >
            <option value="" style={{ background: '#0d1525' }}>♚ Root goal (no parent)</option>
            {allBets.filter(b => b.id !== bet.id && b.status !== 'killed' && b.status !== 'completed').map(b => (
              <option key={b.id} value={b.id} style={{ background: '#0d1525', color: '#e8a045' }}>
                {b.title}
              </option>
            ))}
          </select>
        </div>

        {/* REWARD */}
        {bet.reward && (
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <span>🏆</span>
              <span className="text-[10px] font-mono text-white/30 tracking-widest">REWARD</span>
            </div>
            <p className="text-xs font-mono text-white/70 leading-relaxed">{bet.reward}</p>
          </div>
        )}

        {/* IF NOT */}
        {bet.consequence && (
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: '#e05555' }}>✊</span>
              <span className="text-[10px] font-mono tracking-widest" style={{ color: '#e05555', opacity: 0.7 }}>IF NOT</span>
            </div>
            <p className="text-xs font-mono text-white/70 leading-relaxed">{bet.consequence}</p>
          </div>
        )}

        {/* SCORE */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <span>🕐</span>
            <span className="text-[10px] font-mono text-white/30 tracking-widest">SCORE</span>
          </div>
          <span className="text-sm font-mono text-amber tabular-nums">{score.toFixed(4)}</span>
          <div className="flex gap-3 mt-1">
            <span className="text-[10px] font-mono text-white/25">
              certainty {(bet.certainty * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] font-mono text-white/25">
              impact {(bet.intrinsic_impact * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Tasks */}
        {tasks.length > 0 && (
          <div className="px-4 py-3 border-b border-white/5">
            <span className="text-[10px] font-mono text-white/30 tracking-widest block mb-2">TASKS</span>
            <div className="flex flex-col gap-1">
              {tasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => onOpenTask(task.id)}
                  className="flex items-center gap-2 text-left hover:bg-white/5 px-2 py-1.5 rounded transition-colors"
                >
                  <span className="text-[10px] font-mono text-white/25 w-14 shrink-0">
                    {task.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-white/60 flex-1 truncate">{task.title}</span>
                  <span className="text-[10px] font-mono text-amber/50 shrink-0">
                    {computeTaskCumulativeScore(task, allBets).toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-3 flex flex-col gap-1">
          <ActionBtn
            label="+ ADD TO QUEUE"
            onClick={onAddToQueue}
            highlight
          />
          {!bet.locked ? (
            <ActionBtn label="LOCK" onClick={onLock} />
          ) : (
            <ActionBtn label="UNLOCK" onClick={onUnlock} highlight />
          )}
          {bet.status === 'active' && (
            <ActionBtn
              label="PAUSE"
              onClick={() => onUpdate({ status: 'paused' })}
            />
          )}
          {bet.status === 'paused' && (
            <ActionBtn
              label="RESUME"
              onClick={() => onUpdate({ status: 'active', last_active_at: new Date().toISOString() })}
            />
          )}
          <ActionBtn
            label="ARCHIVE"
            onClick={() => { onUpdate({ status: 'completed' }); onClose() }}
          />
          <ActionBtn
            label="DELETE"
            onClick={() => { if (confirm(`Delete "${bet.title}"? This cannot be undone.`)) onDelete() }}
            danger
          />
        </div>
      </div>
    </div>
  )
}

// ─── Habit Panel ─────────────────────────────────────────────────────────────

import type { Habit } from '@/lib/types'

function HabitPanel({ habit, onClose, onComplete }: { habit: Habit; onClose: () => void; onComplete: () => void }) {
  const isDue = new Date(habit.next_due_at) <= new Date()
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-teal/20 shrink-0" style={{ background: '#0a2020' }}>
        <span className="text-teal text-lg">◈</span>
        <span className="text-xs font-mono text-teal/80 flex-1 truncate tracking-wide">{habit.title}</span>
        <button onClick={onClose} className="text-white/30 hover:text-white/70 text-xs font-mono">✕</button>
      </div>
      <div className="flex-1 px-4 py-4 flex flex-col gap-4">
        <div className="flex gap-4">
          <div>
            <div className="text-[10px] font-mono text-white/30 mb-1">TYPE</div>
            <div className="text-xs font-mono text-teal/70">{habit.type.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/30 mb-1">RECURRENCE</div>
            <div className="text-xs font-mono text-white/60">every {habit.recurrence_hours}h</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-white/30 mb-1">STATUS</div>
            <div className={`text-xs font-mono ${isDue ? 'text-teal' : 'text-white/40'}`}>
              {isDue ? 'DUE NOW' : habit.status.toUpperCase()}
            </div>
          </div>
        </div>
        {isDue && (
          <button
            onClick={onComplete}
            className="w-full py-2 text-xs font-mono tracking-widest border border-teal/40 text-teal bg-teal/5 hover:bg-teal/15 transition-colors"
          >
            ✓ MARK DONE
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function ActionBtn({ label, onClick, danger, highlight }: {
  label: string; onClick: () => void; danger?: boolean; highlight?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-2 text-xs font-mono tracking-widest border transition-colors ${
        danger
          ? 'border-red-500/20 text-red-400/50 hover:text-red-400/80 hover:border-red-500/40'
          : highlight
          ? 'border-amber/40 text-amber bg-amber/5 hover:bg-amber/15'
          : 'border-white/8 text-white/35 hover:text-white/60 hover:border-white/15'
      }`}
    >
      {label}
    </button>
  )
}
