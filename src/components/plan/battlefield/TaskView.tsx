import { useTaskStore } from '@/store/useTaskStore'
import { useBattlefieldStore } from '@/store/useBattlefieldStore'
import { useBetStore } from '@/store/useBetStore'
import { computeTaskCumulativeScore } from '@/lib/scoring'

export function TaskView() {
  const { panelTaskId, closeTaskView } = useBattlefieldStore()
  const { tasks } = useTaskStore()
  const { bets } = useBetStore()

  if (!panelTaskId) return null
  const task = tasks.find(t => t.id === panelTaskId)
  if (!task) return null

  const score = computeTaskCumulativeScore(task, bets)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 shrink-0">
        <button
          onClick={closeTaskView}
          className="text-white/30 hover:text-white/70 text-xs font-mono"
        >
          ← BACK
        </button>
        <span className="text-xs font-mono text-white/30">TASK</span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <h3 className="text-sm font-mono text-white/90 leading-snug">{task.title}</h3>

        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono text-white/30">SCORE</span>
            <span className="text-xs font-mono text-amber">{score.toFixed(3)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono text-white/30">EST. TIME</span>
            <span className="text-xs font-mono text-white/60">{task.estimated_time}m</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono text-white/30">STATUS</span>
            <span className="text-xs font-mono text-white/60">{task.status.toUpperCase()}</span>
          </div>
        </div>

        {task.objectives.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono text-white/30 tracking-widest">OBJECTIVES</span>
            {task.objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-white/20 font-mono text-xs mt-0.5">□</span>
                <span className="text-xs font-mono text-white/60">{obj}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
