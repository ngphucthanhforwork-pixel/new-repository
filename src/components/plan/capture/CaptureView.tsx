import { useState } from 'react'
import { useBetStore } from '@/store/useBetStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useHabitStore } from '@/store/useHabitStore'
import { computeChessRank, computeCumulativeScore } from '@/lib/scoring'
import { CapturePanel } from './CapturePanel'
import { UnprocessedList } from './UnprocessedList'

export function CaptureView() {
  const [panelOpen, setPanelOpen] = useState(false)
  const { bets, updateBet } = useBetStore()
  const { tasks } = useTaskStore()
  const { habits } = useHabitStore()

  const activeBets = bets.filter(b => b.status === 'active')
  const rootBets = activeBets.filter(b => !b.parent_bet_id)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-white/30 tracking-widest">INTELLIGENCE</span>
          <span className="text-xs font-mono text-white/15">
            {bets.length} bets · {tasks.length} tasks · {habits.length} habits
          </span>
        </div>
        <button
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-2 px-4 py-1.5 text-xs font-mono tracking-widest
            border border-amber/40 text-amber bg-amber/5 hover:bg-amber/15 transition-colors"
        >
          + CAPTURE
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Unprocessed banner */}
        <UnprocessedList />

        {/* Empty state */}
        {bets.length === 0 && tasks.length === 0 && habits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-4xl opacity-20">♚</span>
            <p className="text-sm font-mono text-white/30 max-w-xs">
              Nothing here yet. Start by placing your first bet — a hypothesis you want to test.
            </p>
            <button
              onClick={() => setPanelOpen(true)}
              className="mt-2 px-6 py-2 text-xs font-mono tracking-widest border border-amber/40
                text-amber bg-amber/5 hover:bg-amber/15 transition-colors"
            >
              + PLACE FIRST BET
            </button>
          </div>
        )}

        {/* Bet tree */}
        {rootBets.length > 0 && (
          <div className="flex flex-col gap-3">
            {rootBets.map(bet => (
              <BetRow key={bet.id} betId={bet.id} depth={0} />
            ))}
          </div>
        )}

        {/* Paused / killed bets */}
        {bets.filter(b => b.status === 'paused' || b.status === 'killed').length > 0 && (
          <div className="mt-8">
            <div className="text-xs font-mono text-white/20 tracking-widest mb-3">INACTIVE</div>
            <div className="flex flex-col gap-2">
              {bets.filter(b => b.status === 'paused' || b.status === 'killed').map(bet => (
                <div key={bet.id} className="flex items-center gap-3 px-3 py-2 bg-white/3 border border-white/5 rounded opacity-40">
                  <span className="text-sm">{computeChessRank(bet, bets)}</span>
                  <span className="text-xs font-mono text-white/60 flex-1">{bet.title}</span>
                  <span className="text-[10px] font-mono text-white/30">{bet.status.toUpperCase()}</span>
                  {bet.status === 'paused' && (
                    <button
                      onClick={() => updateBet(bet.id, { status: 'active', last_active_at: new Date().toISOString() })}
                      className="text-[10px] font-mono text-amber/60 hover:text-amber transition-colors"
                    >
                      RESUME
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CapturePanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  )
}

// Recursive bet row component
function BetRow({ betId, depth }: { betId: string; depth: number }) {
  const [expanded, setExpanded] = useState(depth === 0)
  const { bets, updateBet } = useBetStore()
  const { tasks } = useTaskStore()
  const { habits } = useHabitStore()

  const bet = bets.find(b => b.id === betId)
  if (!bet) return null

  const children = bets.filter(b => b.parent_bet_id === betId && b.status === 'active')
  const betTasks = tasks.filter(t => t.bet_id === betId && !t.unprocessed)
  const betHabits = habits.filter(h => h.parent_id === betId && !h.unprocessed)
  const rank = computeChessRank(bet, bets)
  const score = computeCumulativeScore(bet, bets)
  const hasChildren = children.length > 0 || betTasks.length > 0 || betHabits.length > 0

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white/3 border border-white/8 rounded group hover:border-white/15 transition-colors">
        {/* Expand toggle */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-white/20 hover:text-white/60 text-xs w-4 shrink-0 transition-colors"
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        <span className="text-base shrink-0">{rank}</span>
        <span className="text-sm font-mono text-white/80 flex-1 truncate">{bet.title}</span>

        <span className="text-xs font-mono text-amber/60 tabular-nums shrink-0">
          {score.toFixed(2)}
        </span>

        {/* Actions (show on hover) */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => updateBet(bet.id, { status: 'paused' })}
            className="text-[10px] font-mono text-white/30 hover:text-white/60 px-1.5 py-0.5 border border-white/10 transition-colors"
          >
            PAUSE
          </button>
          <button
            onClick={() => {
              if (confirm(`Kill "${bet.title}"? This cannot be undone.`)) {
                updateBet(bet.id, { status: 'killed' })
              }
            }}
            className="text-[10px] font-mono text-white/20 hover:text-red-400/60 px-1.5 py-0.5 border border-white/10 transition-colors"
          >
            KILL
          </button>
        </div>
      </div>

      {/* Children */}
      {expanded && (
        <div className="mt-1 flex flex-col gap-1">
          {children.map(child => (
            <BetRow key={child.id} betId={child.id} depth={depth + 1} />
          ))}
          {betTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-2 px-3 py-1.5 border border-white/5 rounded"
              style={{ marginLeft: (depth + 1) * 20 }}
            >
              <span className="text-[10px] font-mono text-white/25 w-8 shrink-0">TASK</span>
              <span className="text-xs font-mono text-white/50 flex-1 truncate">{task.title}</span>
              <span className="text-[10px] font-mono text-white/20">{task.estimated_time}m</span>
            </div>
          ))}
          {betHabits.map(habit => (
            <div
              key={habit.id}
              className="flex items-center gap-2 px-3 py-1.5 border border-white/5 rounded"
              style={{ marginLeft: (depth + 1) * 20 }}
            >
              <span className="text-[10px] font-mono text-teal/40 w-8 shrink-0">HAB</span>
              <span className="text-xs font-mono text-white/50 flex-1 truncate">{habit.title}</span>
              <span className="text-[10px] font-mono text-white/20">{habit.recurrence_hours}h</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
