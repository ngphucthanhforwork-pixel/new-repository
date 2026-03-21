import { useTaskStore } from '@/store/useTaskStore'
import { useHabitStore } from '@/store/useHabitStore'
import { useBetStore } from '@/store/useBetStore'

export function UnprocessedList() {
  const { tasks, updateTask } = useTaskStore()
  const { habits, updateHabit } = useHabitStore()
  const { bets } = useBetStore()

  const unprocessedTasks = tasks.filter(t => t.unprocessed)
  const unprocessedHabits = habits.filter(h => h.unprocessed)

  if (unprocessedTasks.length === 0 && unprocessedHabits.length === 0) return null

  const activeBets = bets.filter(b => b.status === 'active' || b.status === 'paused')

  return (
    <div className="border border-amber/20 bg-amber/5 rounded p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
        <span className="text-xs font-mono tracking-widest text-amber">
          UNPROCESSED — {unprocessedTasks.length + unprocessedHabits.length} items need assignment
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {unprocessedTasks.map(task => (
          <UnprocessedItem
            key={task.id}
            label={task.title}
            type="TASK"
            bets={activeBets}
            onAssign={(betId) => updateTask(task.id, { bet_id: betId, unprocessed: false })}
            onDismiss={() => updateTask(task.id, { unprocessed: false })}
          />
        ))}
        {unprocessedHabits.map(habit => (
          <UnprocessedItem
            key={habit.id}
            label={habit.title}
            type="HABIT"
            bets={activeBets}
            onAssign={(betId) => updateHabit(habit.id, { parent_id: betId, unprocessed: false })}
            onDismiss={() => updateHabit(habit.id, { unprocessed: false })}
          />
        ))}
      </div>
    </div>
  )
}

interface UnprocessedItemProps {
  label: string
  type: string
  bets: { id: string; title: string }[]
  onAssign: (betId: string) => void
  onDismiss: () => void
}

function UnprocessedItem({ label, type, bets, onAssign, onDismiss }: UnprocessedItemProps) {
  return (
    <div className="flex items-center gap-2 group">
      <span className="text-[10px] font-mono text-white/30 w-10 shrink-0">{type}</span>
      <span className="text-xs font-mono text-white/70 flex-1 truncate">{label}</span>
      <select
        className="text-xs font-mono bg-white/5 border border-white/10 text-white/50 px-2 py-0.5 rounded outline-none
          focus:border-amber/40 cursor-pointer"
        defaultValue=""
        onChange={e => { if (e.target.value) onAssign(e.target.value) }}
      >
        <option value="" disabled>assign →</option>
        {bets.map(b => (
          <option key={b.id} value={b.id}>{b.title}</option>
        ))}
      </select>
      <button
        onClick={onDismiss}
        className="text-white/20 hover:text-white/50 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  )
}
