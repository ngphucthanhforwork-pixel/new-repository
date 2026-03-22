import { useState } from 'react'
import { BattlefieldCanvas } from './BattlefieldCanvas'
import { ZoneLayer } from './ZoneLayer'
import { ArrowLayer } from './ArrowLayer'
import { PiecesLayer } from './PiecesLayer'
import { MissionPanel } from './MissionPanel'
import { useBetStore } from '@/store/useBetStore'
import { useHabitStore } from '@/store/useHabitStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useAppStore } from '@/store/useAppStore'
import { computeTaskCumulativeScore } from '@/lib/scoring'

export function BattlefieldView() {
  const { bets } = useBetStore()
  const { habits } = useHabitStore()
  const { tasks } = useTaskStore()
  const { openTaskCard } = useAppStore()

  const [backlogOpen, setBacklogOpen] = useState(false)

  const backlogTasks = tasks.filter(t => t.status === 'backlog' && !t.unprocessed)
  const hasContent = bets.length > 0 || habits.length > 0

  return (
    <div className="relative w-full h-full overflow-hidden">
      <BattlefieldCanvas>
        <ZoneLayer />
        <ArrowLayer />
        <PiecesLayer />
      </BattlefieldCanvas>

      <MissionPanel />

      {/* ── Backlog toggle button ─────────────────────────────────── */}
      <button
        onClick={() => setBacklogOpen(o => !o)}
        className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] tracking-widest transition-colors"
        style={{
          background: backlogOpen ? 'rgba(232,160,69,0.15)' : 'rgba(7,12,20,0.85)',
          border: `1px solid ${backlogOpen ? 'rgba(232,160,69,0.4)' : 'rgba(255,255,255,0.08)'}`,
          color: backlogOpen ? '#e8a045' : 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(6px)',
        }}
      >
        BACKLOG
        {backlogTasks.length > 0 && (
          <span
            className="font-mono text-[10px] px-1.5 py-0.5"
            style={{
              background: 'rgba(232,160,69,0.2)',
              color: '#e8a045',
              minWidth: 20,
              textAlign: 'center',
            }}
          >
            {backlogTasks.length}
          </span>
        )}
      </button>

      {/* ── Backlog slide-in panel ────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 h-full z-20 flex flex-col transition-transform duration-200 ease-out"
        style={{
          width: 300,
          background: 'rgba(7,12,20,0.96)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          transform: backlogOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span className="font-mono text-[11px] tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            BACKLOG
          </span>
          <button
            onClick={() => setBacklogOpen(false)}
            className="font-mono text-xs transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            ✕
          </button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto">
          {backlogTasks.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
                No tasks in backlog.<br />Capture a task to get started.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {backlogTasks
                .sort((a, b) => computeTaskCumulativeScore(b, bets) - computeTaskCumulativeScore(a, bets))
                .map(task => {
                  const score = computeTaskCumulativeScore(task, bets)
                  const parentBet = bets.find(b => b.id === task.bet_id)
                  return (
                    <button
                      key={task.id}
                      onClick={() => openTaskCard(task.id)}
                      className="text-left px-5 py-3.5 transition-colors group"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="font-mono text-xs leading-snug flex-1 min-w-0"
                          style={{ color: 'rgba(255,255,255,0.75)' }}
                        >
                          {task.title}
                        </span>
                        <span
                          className="font-mono text-[10px] shrink-0 tabular-nums"
                          style={{ color: 'rgba(232,160,69,0.55)' }}
                        >
                          {score.toFixed(3)}
                        </span>
                      </div>
                      {parentBet && (
                        <span
                          className="font-mono text-[10px] mt-1 block truncate"
                          style={{ color: 'rgba(232,160,69,0.35)' }}
                        >
                          ⬦ {parentBet.title}
                        </span>
                      )}
                      {task.due_date && (
                        <span
                          className="font-mono text-[10px] mt-1 block"
                          style={{ color: 'rgba(255,255,255,0.25)' }}
                        >
                          due {task.due_date.split('-').reverse().join('/').replace(/^(\d{2})\/(\d{2})\/\d{2}(\d{2})$/, '$1/$2/$3')}
                        </span>
                      )}
                    </button>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Empty state overlay */}
      {!hasContent && !backlogOpen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <span className="text-5xl opacity-10">♚</span>
          <p className="text-xs font-mono text-white/20 text-center max-w-xs">
            No bets on the battlefield yet.<br />Go to Capture and place your first bet.
          </p>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 text-[10px] font-mono text-white/15 pointer-events-none leading-relaxed">
        scroll to zoom · drag background to pan · click piece to inspect
      </div>
    </div>
  )
}
