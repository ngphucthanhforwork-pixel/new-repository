import { useBetStore } from '@/store/useBetStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useCampaignStore } from '@/store/useCampaignStore'
import { useAppStore } from '@/store/useAppStore'
import { computeTaskCumulativeScore } from '@/lib/scoring'

export function MicroQueue() {
  const { bets } = useBetStore()
  const { tasks, updateTask } = useTaskStore()
  const { grandQueue, microQueue, addToMicro, removeFromMicro, moveInMicro } = useCampaignStore()
  const { setMode, setActiveTask } = useAppStore()

  // Tasks from bets in the grand queue that haven't been completed
  const eligibleTasks = tasks.filter(
    t => t.bet_id && grandQueue.includes(t.bet_id) && t.status !== 'completed' && !t.unprocessed
  )

  const queued = microQueue
    .map(id => eligibleTasks.find(t => t.id === id) ?? tasks.find(t => t.id === id))
    .filter(Boolean) as typeof tasks

  const available = eligibleTasks
    .filter(t => !microQueue.includes(t.id))
    .sort((a, b) => computeTaskCumulativeScore(b, bets) - computeTaskCumulativeScore(a, bets))

  function startTask(taskId: string) {
    updateTask(taskId, { status: 'active', queued_at: new Date().toISOString() })
    setActiveTask(taskId)
    setMode('execute')
  }

  const totalMinutes = queued.reduce((s, t) => s + t.estimated_time, 0)
  const totalHours = (totalMinutes / 60).toFixed(1)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/8 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-white/30 tracking-widest mb-0.5">MICRO QUEUE</div>
            <div className="text-[10px] font-mono text-white/15">Tasks ordered for execution</div>
          </div>
          {queued.length > 0 && (
            <span className="text-[10px] font-mono text-white/20 tabular-nums">
              ~{totalHours}h total
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Queued tasks */}
        <div className="px-4 py-3 flex flex-col gap-1.5 shrink-0">
          {queued.length === 0 && (
            <p className="text-[10px] font-mono text-white/20 py-3 text-center">
              {grandQueue.length === 0
                ? 'Add bets to the Grand Queue first'
                : 'No tasks queued — add from below'}
            </p>
          )}
          {queued.map((task, i) => {
            const score = computeTaskCumulativeScore(task, bets)
            const isFirst = i === 0
            return (
              <div
                key={task.id}
                className={`flex items-center gap-2 px-3 py-2 border group transition-colors ${
                  isFirst
                    ? 'border-amber/30 bg-amber/5'
                    : 'border-white/8 bg-white/2'
                }`}
              >
                <span className="text-white/20 font-mono text-[10px] w-4 text-right shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-white/80 truncate">{task.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-mono text-white/25">{task.estimated_time}m</span>
                    <span className="text-[9px] font-mono text-amber/40">{score.toFixed(3)}</span>
                    {task.objectives.length > 0 && (
                      <span className="text-[9px] font-mono text-white/20">{task.objectives.length} obj</span>
                    )}
                  </div>
                </div>
                {/* Reorder */}
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    disabled={i === 0}
                    onClick={() => moveInMicro(i, i - 1)}
                    className="w-5 h-5 text-white/30 hover:text-white/70 disabled:opacity-20 font-mono text-xs flex items-center justify-center transition-colors"
                  >↑</button>
                  <button
                    disabled={i === queued.length - 1}
                    onClick={() => moveInMicro(i, i + 1)}
                    className="w-5 h-5 text-white/30 hover:text-white/70 disabled:opacity-20 font-mono text-xs flex items-center justify-center transition-colors"
                  >↓</button>
                </div>
                <button
                  onClick={() => removeFromMicro(task.id)}
                  className="text-white/20 hover:text-white/60 font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >✕</button>
                {/* Start button — always visible on first, hover on rest */}
                <button
                  onClick={() => startTask(task.id)}
                  className={`px-2 py-1 text-[10px] font-mono tracking-widest border transition-colors shrink-0 ${
                    isFirst
                      ? 'border-amber/50 text-amber bg-amber/10 hover:bg-amber/20'
                      : 'border-white/10 text-white/30 hover:text-amber hover:border-amber/30 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {isFirst ? '→ START' : 'START'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Divider */}
        {available.length > 0 && (
          <div className="px-4 pb-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[9px] font-mono text-white/20 tracking-widest">AVAILABLE</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
          </div>
        )}

        {/* Available tasks */}
        <div className="px-4 pb-4 flex flex-col gap-1">
          {available.map(task => {
            const score = computeTaskCumulativeScore(task, bets)
            const bet = bets.find(b => b.id === task.bet_id)
            return (
              <div
                key={task.id}
                className="flex items-center gap-2 px-3 py-1.5 border border-white/5 hover:border-white/10 group transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-white/50 truncate">{task.title}</div>
                  {bet && (
                    <div className="text-[9px] font-mono text-white/20 truncate mt-0.5">{bet.title}</div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-white/25 tabular-nums shrink-0">{task.estimated_time}m</span>
                <span className="text-[10px] font-mono text-white/20 tabular-nums shrink-0">{score.toFixed(3)}</span>
                <button
                  onClick={() => addToMicro(task.id)}
                  className="text-[10px] font-mono text-amber/50 hover:text-amber transition-colors opacity-0 group-hover:opacity-100 shrink-0 px-1.5 py-0.5 border border-amber/20 hover:border-amber/50"
                >+ ADD</button>
              </div>
            )
          })}
          {grandQueue.length > 0 && available.length === 0 && queued.length === 0 && (
            <p className="text-[10px] font-mono text-white/20 py-3 text-center">
              No tasks found. Add tasks to your queued bets in Capture.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
