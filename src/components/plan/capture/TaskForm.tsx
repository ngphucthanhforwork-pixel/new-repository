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

  function addObjective() { setObjectives(prev => [...prev, '']) }
  function updateObjective(i: number, val: string) { setObjectives(prev => prev.map((o, idx) => idx === i ? val : o)) }
  function removeObjective(i: number) { setObjectives(prev => prev.filter((_, idx) => idx !== i)) }

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

  const sep = <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginLeft: -20, marginRight: -20 }} />

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      <FormField label="Task" required>
        <input
          className={inputClass}
          style={{ caretColor: '#e8a045' }}
          placeholder="What needs to get done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </FormField>

      {sep}

      {/* Park toggle */}
      <button
        type="button"
        onClick={() => setPark(p => !p)}
        className="flex items-center gap-3 text-left"
      >
        <div
          className="relative shrink-0 transition-colors"
          style={{
            width: 28, height: 14, borderRadius: 7,
            background: park ? 'rgba(232,160,69,0.5)' : 'rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="absolute top-0.5 left-0.5 rounded-full bg-white transition-transform"
            style={{ width: 11, height: 11, transform: park ? 'translateX(14px)' : 'none' }}
          />
        </div>
        <span className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
          Park for later (no bet yet)
        </span>
      </button>

      {!park && (
        <FormField label="Parent Bet" hint="Which bet does this task serve?">
          <select
            className={inputClass}
            style={{
              caretColor: '#e8a045', appearance: 'none', cursor: 'pointer',
              color: betId ? 'rgba(232,160,69,0.8)' : 'rgba(255,255,255,0.25)',
            }}
            value={betId}
            onChange={e => setBetId(e.target.value)}
          >
            <option value="" style={{ background: '#0d1525', color: 'rgba(255,255,255,0.4)' }}>— Select a bet</option>
            {activeBets.map(b => (
              <option key={b.id} value={b.id} style={{ background: '#0d1525', color: '#e8a045' }}>{b.title}</option>
            ))}
          </select>
        </FormField>
      )}

      {sep}

      <FormField label="Objectives" hint="Checkable steps inside this task.">
        <div className="flex flex-col gap-2">
          {objectives.map((obj, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="font-mono text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>□</span>
              <input
                className={inputClass}
                style={{ caretColor: '#e8a045' }}
                placeholder={`Objective ${i + 1}`}
                value={obj}
                onChange={e => updateObjective(i, e.target.value)}
              />
              {objectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeObjective(i)}
                  className="font-mono text-xs shrink-0 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addObjective}
            className="text-left font-mono transition-colors"
            style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginLeft: 20 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(232,160,69,0.6)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
          >
            + ADD OBJECTIVE
          </button>
        </div>
      </FormField>

      {sep}

      <FormField label="Estimated Time">
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={5}
            step={5}
            className={inputClass}
            style={{ caretColor: '#e8a045', width: 80 }}
            value={estimatedTime}
            onChange={e => setEstimatedTime(parseInt(e.target.value) || 30)}
          />
          <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>min</span>
          <div className="flex gap-1 ml-auto">
            {[15, 25, 45, 90].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setEstimatedTime(t)}
                className="font-mono px-1.5 py-0.5 transition-colors"
                style={{
                  fontSize: 9,
                  color: estimatedTime === t ? '#e8a045' : 'rgba(255,255,255,0.2)',
                  border: `1px solid ${estimatedTime === t ? 'rgba(232,160,69,0.3)' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                {t}m
              </button>
            ))}
          </div>
        </div>
      </FormField>

      <ScoreSlider label="Certainty" value={certainty} onChange={setCertainty} />
      <ScoreSlider label="Intrinsic Impact" value={intrinsicImpact} onChange={setIntrinsicImpact} />

      <button
        type="submit"
        disabled={!title.trim()}
        className="mt-1 w-full py-2.5 font-mono text-xs tracking-widest transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        style={{
          background: 'rgba(232,160,69,0.08)',
          border: '1px solid rgba(232,160,69,0.3)',
          color: '#e8a045',
        }}
        onMouseEnter={e => { if (title.trim()) e.currentTarget.style.background = 'rgba(232,160,69,0.18)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,160,69,0.08)' }}
      >
        {park ? 'PARK TASK' : 'ADD TASK'}
      </button>
    </form>
  )
}
