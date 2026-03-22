import { useState } from 'react'
import { useTaskStore } from '@/store/useTaskStore'
import { useBetStore } from '@/store/useBetStore'
import { FormField, inputClass } from '@/components/ui/FormField'
import { ScoreSlider } from '@/components/ui/ScoreSlider'

interface TaskFormProps {
  onDone: () => void
  initialTitle?: string
}

export function TaskForm({ onDone, initialTitle = '' }: TaskFormProps) {
  const { addTask } = useTaskStore()
  const { bets } = useBetStore()
  const [title, setTitle] = useState(initialTitle)
  const [betId, setBetId] = useState('')
  const [objectives, setObjectives] = useState<string[]>([''])
  const [estimatedTime, setEstimatedTime] = useState(30)
  const [certainty, setCertainty] = useState(0.5)
  const [intrinsicImpact, setIntrinsicImpact] = useState(0.5)
  const [park, setPark] = useState(false)

  const activeBets = bets.filter(b => b.status === 'active' || b.status === 'paused')

  function addObjective() {
    setObjectives(prev => [...prev, ''])
  }

  function updateObjective(i: number, val: string) {
    setObjectives(prev => prev.map((o, idx) => idx === i ? val : o))
  }

  function removeObjective(i: number) {
    setObjectives(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addTask({
      title: title.trim(),
      bet_id: park ? undefined : betId || undefined,
      objectives: objectives.filter(o => o.trim()),
      estimated_time: estimatedTime,
      certainty,
      intrinsic_impact: intrinsicImpact,
      status: 'queued',
      unprocessed: park || !betId,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField label="Task" required>
        <input
          className={inputClass}
          placeholder="What needs to get done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </FormField>

      {/* Park toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setPark(p => !p)}
          className={`w-8 h-4 rounded-full transition-colors ${park ? 'bg-amber/60' : 'bg-white/10'}`}
        >
          <div className={`w-3 h-3 mt-0.5 ml-0.5 rounded-full bg-white transition-transform ${park ? 'translate-x-4' : ''}`} />
        </div>
        <span className="text-xs font-mono text-white/40">Park for later (no bet yet)</span>
      </label>

      {!park && (
        <FormField label="Bet" required hint="Which bet does this task serve?">
          <select
            className={inputClass}
            value={betId}
            onChange={e => setBetId(e.target.value)}
          >
            <option value="">— Select a bet</option>
            {activeBets.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label="Objectives" hint="Checkable steps inside this task.">
        <div className="flex flex-col gap-2">
          {objectives.map((obj, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={inputClass}
                placeholder={`Objective ${i + 1}`}
                value={obj}
                onChange={e => updateObjective(i, e.target.value)}
              />
              {objectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeObjective(i)}
                  className="text-white/20 hover:text-white/60 text-xs font-mono px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addObjective}
            className="text-left text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
          >
            + ADD OBJECTIVE
          </button>
        </div>
      </FormField>

      <FormField label="Estimated Time">
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={5}
            step={5}
            className={inputClass + ' w-24'}
            value={estimatedTime}
            onChange={e => setEstimatedTime(parseInt(e.target.value) || 30)}
          />
          <span className="text-xs font-mono text-white/30">minutes</span>
        </div>
      </FormField>

      <ScoreSlider label="Certainty" value={certainty} onChange={setCertainty} />
      <ScoreSlider label="Intrinsic Impact" value={intrinsicImpact} onChange={setIntrinsicImpact} />

      <button
        type="submit"
        disabled={!title.trim()}
        className="mt-2 w-full py-2 text-xs font-mono tracking-widest bg-amber/10 border border-amber/30
          text-amber hover:bg-amber/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {park ? 'PARK TASK' : 'ADD TASK'}
      </button>
    </form>
  )
}
