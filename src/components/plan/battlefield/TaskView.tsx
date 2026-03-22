import { useTaskStore } from '@/store/useTaskStore'
import { useBattlefieldStore } from '@/store/useBattlefieldStore'
import { useBetStore } from '@/store/useBetStore'
import { useAppStore } from '@/store/useAppStore'
import { computeTaskCumulativeScore } from '@/lib/scoring'

export function TaskView() {
  const { panelTaskId, closeTaskView, deselect } = useBattlefieldStore()
  const { tasks, updateTask } = useTaskStore()
  const { bets } = useBetStore()
  const { setMode, setActiveTask } = useAppStore()

  if (!panelTaskId) return null
  const task = tasks.find(t => t.id === panelTaskId)
  if (!task) return null

  const taskId = task.id
  const score = computeTaskCumulativeScore(task, bets)
  const parentBet = bets.find(b => b.id === task.bet_id)

  function startMission() {
    updateTask(taskId, { status: 'active', queued_at: new Date().toISOString() })
    setActiveTask(taskId)
    setMode('execute')
    deselect()
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#080d18' }}>

      {/* ── Back nav ─────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={closeTaskView}
          className="font-mono text-[11px] transition-colors"
          style={{ color: 'rgba(255,255,255,0.28)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
        >
          ← BACK
        </button>
      </div>

      {/* ── Amber mission-type bar (Ghostwire style) ──────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ background: '#c47a1a' }}
      >
        <span
          className="font-mono text-[11px] tracking-widest font-semibold"
          style={{ color: 'rgba(0,0,0,0.75)' }}
        >
          {task.bet_id ? 'MISSION' : 'SIDE TASK'}
        </span>
        <span
          className="font-mono text-[10px] tabular-nums"
          style={{ color: 'rgba(0,0,0,0.5)' }}
        >
          {score.toFixed(3)}
        </span>
      </div>

      {/* ── Scrollable body ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* Title block */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2
            className="font-mono leading-snug mb-2"
            style={{ fontSize: 17, color: 'rgba(255,255,255,0.92)' }}
          >
            {task.title}
          </h2>
          {parentBet && (
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 11, color: 'rgba(232,160,69,0.45)' }}>⬦</span>
              <span
                className="font-mono truncate"
                style={{ fontSize: 11, color: 'rgba(232,160,69,0.55)' }}
              >
                {parentBet.title}
              </span>
            </div>
          )}
        </div>

        {/* REWARD */}
        {parentBet?.reward && (
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] tracking-widest" style={{ color: '#e8a045' }}>
                REWARD
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ fontSize: 14, color: '#e8a045', opacity: 0.7, marginTop: 1 }}>🏆</span>
              <p className="font-mono text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {parentBet.reward}
              </p>
            </div>
          </div>
        )}

        {/* IF NOT */}
        {parentBet?.consequence && (
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] tracking-widest" style={{ color: '#e05555' }}>
                IF NOT
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ fontSize: 14, color: '#e05555', opacity: 0.7, marginTop: 1 }}>✊</span>
              <p className="font-mono text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {parentBet.consequence}
              </p>
            </div>
          </div>
        )}

        {/* OBJECTIVES */}
        {task.objectives.length > 0 && (
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span
              className="font-mono text-[10px] tracking-widest block mb-3"
              style={{ color: 'rgba(255,255,255,0.28)' }}
            >
              OBJECTIVES
            </span>
            <div className="flex flex-col gap-2">
              {task.objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className="font-mono shrink-0 mt-0.5"
                    style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}
                  >
                    □
                  </span>
                  <span
                    className="font-mono text-xs leading-snug"
                    style={{ color: 'rgba(255,255,255,0.58)' }}
                  >
                    {obj}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="px-5 py-3 flex items-center gap-5 shrink-0">
          <div>
            <div className="font-mono text-[9px] tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
              EST. TIME
            </div>
            <div className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {task.estimated_time}m
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
              PRIORITY
            </div>
            <div className="font-mono text-xs" style={{ color: '#e8a045', opacity: 0.75 }}>
              {score.toFixed(4)}
            </div>
          </div>
          {task.objectives.length > 0 && (
            <div>
              <div className="font-mono text-[9px] tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
                OBJ
              </div>
              <div className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {task.objectives.length}
              </div>
            </div>
          )}
          <div>
            <div className="font-mono text-[9px] tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
              STATUS
            </div>
            <div className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {task.status.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* ── START MISSION CTA ─────────────────────────────────────── */}
      <div
        className="px-5 py-4 shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {task.status !== 'completed' ? (
          <button
            onClick={startMission}
            className="w-full py-3 font-mono text-xs tracking-widest transition-colors"
            style={{
              background: 'rgba(232,160,69,0.1)',
              border: '1px solid rgba(232,160,69,0.45)',
              color: '#e8a045',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(232,160,69,0.2)'
              e.currentTarget.style.borderColor = 'rgba(232,160,69,0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(232,160,69,0.1)'
              e.currentTarget.style.borderColor = 'rgba(232,160,69,0.45)'
            }}
          >
            → START MISSION
          </button>
        ) : (
          <div
            className="w-full py-3 text-center font-mono text-xs tracking-widest"
            style={{ color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            ✓ COMPLETED
          </div>
        )}
      </div>
    </div>
  )
}
