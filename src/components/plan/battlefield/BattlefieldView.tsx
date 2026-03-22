import { useState } from 'react'
import { BattlefieldCanvas } from './BattlefieldCanvas'
import { ZoneLayer } from './ZoneLayer'
import { ArrowLayer } from './ArrowLayer'
import { PiecesLayer } from './PiecesLayer'
import { MissionPanel } from './MissionPanel'
import { BattlefieldListView } from './BattlefieldListView'
import { useBetStore } from '@/store/useBetStore'
import { useHabitStore } from '@/store/useHabitStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useAppStore } from '@/store/useAppStore'
import { computeTaskCumulativeScore } from '@/lib/scoring'

type BattlefieldMode = 'list' | 'map'

export function BattlefieldView() {
  const [mode, setMode] = useState<BattlefieldMode>('list')
  const [backlogOpen, setBacklogOpen] = useState(false)

  const { bets } = useBetStore()
  const { habits } = useHabitStore()
  const { tasks } = useTaskStore()
  const { openTaskCard } = useAppStore()

  const backlogTasks = tasks.filter(t => t.status === 'backlog' && !t.unprocessed)
  const hasMapContent = bets.length > 0 || habits.length > 0

  return (
    <div className="flex flex-col h-full" style={{ background: '#060a10' }}>

      {/* ── Navigation bar ─────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center justify-between px-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', height: 40 }}
      >
        {/* View toggle */}
        <div className="flex items-center gap-px">
          <button
            onClick={() => setMode('list')}
            className="flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] tracking-widest transition-colors"
            style={{
              color: mode === 'list' ? '#e8a045' : 'rgba(255,255,255,0.28)',
              background: mode === 'list' ? 'rgba(232,160,69,0.08)' : 'transparent',
              border: `1px solid ${mode === 'list' ? 'rgba(232,160,69,0.25)' : 'transparent'}`,
            }}
          >
            {/* List icon */}
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <rect y="1" width="11" height="1.5" fill="currentColor" rx="0.5" />
              <rect y="4.5" width="11" height="1.5" fill="currentColor" rx="0.5" />
              <rect y="8" width="11" height="1.5" fill="currentColor" rx="0.5" />
            </svg>
            LIST
          </button>
          <button
            onClick={() => setMode('map')}
            className="flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] tracking-widest transition-colors"
            style={{
              color: mode === 'map' ? '#e8a045' : 'rgba(255,255,255,0.28)',
              background: mode === 'map' ? 'rgba(232,160,69,0.08)' : 'transparent',
              border: `1px solid ${mode === 'map' ? 'rgba(232,160,69,0.25)' : 'transparent'}`,
            }}
          >
            {/* Map/grid icon */}
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <rect width="4.5" height="4.5" fill="currentColor" rx="0.5" />
              <rect x="6.5" width="4.5" height="4.5" fill="currentColor" rx="0.5" />
              <rect y="6.5" width="4.5" height="4.5" fill="currentColor" rx="0.5" />
              <rect x="6.5" y="6.5" width="4.5" height="4.5" fill="currentColor" rx="0.5" />
            </svg>
            MAP
          </button>
        </div>

        {/* Right: backlog button (map mode only) */}
        {mode === 'map' && (
          <button
            onClick={() => setBacklogOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1 font-mono text-[11px] tracking-widest transition-colors"
            style={{
              color: backlogOpen ? '#e8a045' : 'rgba(255,255,255,0.28)',
              border: `1px solid ${backlogOpen ? 'rgba(232,160,69,0.25)' : 'rgba(255,255,255,0.07)'}`,
              background: backlogOpen ? 'rgba(232,160,69,0.08)' : 'transparent',
            }}
          >
            BACKLOG
            {backlogTasks.length > 0 && (
              <span
                className="font-mono text-[10px] px-1 py-0.5 min-w-[18px] text-center"
                style={{ background: 'rgba(232,160,69,0.18)', color: '#e8a045' }}
              >
                {backlogTasks.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ── View content ───────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">

        {/* LIST VIEW */}
        {mode === 'list' && <BattlefieldListView />}

        {/* MAP VIEW */}
        {mode === 'map' && (
          <div className="relative w-full h-full overflow-hidden">
            <BattlefieldCanvas>
              <ZoneLayer />
              <ArrowLayer />
              <PiecesLayer />
            </BattlefieldCanvas>

            <MissionPanel />

            {/* Backlog slide-in panel */}
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
              <div
                className="shrink-0 flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="font-mono text-[11px] tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>BACKLOG</span>
                <button onClick={() => setBacklogOpen(false)} className="font-mono text-xs hover:opacity-70" style={{ color: 'rgba(255,255,255,0.25)' }}>✕</button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {backlogTasks.length === 0 ? (
                  <p className="px-5 py-8 text-center font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
                    No tasks in backlog.
                  </p>
                ) : (
                  backlogTasks
                    .sort((a, b) => computeTaskCumulativeScore(b, bets) - computeTaskCumulativeScore(a, bets))
                    .map(task => {
                      const score = computeTaskCumulativeScore(task, bets)
                      const parentBet = bets.find(b => b.id === task.bet_id)
                      return (
                        <button
                          key={task.id}
                          onClick={() => openTaskCard(task.id)}
                          className="text-left w-full px-5 py-3.5 transition-colors"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-xs leading-snug flex-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{task.title}</span>
                            <span className="font-mono text-[10px] tabular-nums shrink-0" style={{ color: 'rgba(232,160,69,0.55)' }}>{score.toFixed(3)}</span>
                          </div>
                          {parentBet && (
                            <span className="font-mono text-[10px] mt-1 block truncate" style={{ color: 'rgba(232,160,69,0.35)' }}>⬦ {parentBet.title}</span>
                          )}
                        </button>
                      )
                    })
                )}
              </div>
            </div>

            {/* Empty state */}
            {!hasMapContent && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                <span className="text-5xl opacity-10">♚</span>
                <p className="text-xs font-mono text-white/20 text-center max-w-xs">
                  No bets on the battlefield yet.<br />Go to Capture and place your first bet.
                </p>
              </div>
            )}

            <div className="absolute bottom-4 left-4 text-[10px] font-mono text-white/15 pointer-events-none leading-relaxed">
              scroll to zoom · drag background to pan · click piece to inspect
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
