import { useState } from 'react'
import { useHabitStore } from '@/store/useHabitStore'
import { useBetStore } from '@/store/useBetStore'
import { FormField, inputClass } from '@/components/ui/FormField'
import { ScoreSlider } from '@/components/ui/ScoreSlider'

interface HabitFormProps {
  onDone: () => void
  initialTitle?: string
}

const RECURRENCE_PRESETS = [
  { label: 'Daily', hours: 24 },
  { label: '2× / week', hours: 84 },
  { label: 'Weekly', hours: 168 },
  { label: 'Custom', hours: 0 },
]

export function HabitForm({ onDone, initialTitle = '' }: HabitFormProps) {
  const { addHabit } = useHabitStore()
  const { bets } = useBetStore()
  const [title, setTitle] = useState(initialTitle)
  const [type, setType] = useState<'proactive' | 'maintenance'>('proactive')
  const [parentId, setParentId] = useState('')
  const [recurrencePreset, setRecurrencePreset] = useState(24)
  const [customHours, setCustomHours] = useState(24)
  const [certainty, setCertainty] = useState(0.5)
  const [intrinsicImpact, setIntrinsicImpact] = useState(0.5)
  const [park, setPark] = useState(false)

  const activeBets = bets.filter(b => b.status === 'active' || b.status === 'paused')
  const recurrenceHours = recurrencePreset === 0 ? customHours : recurrencePreset

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addHabit({
      title: title.trim(),
      type,
      parent_id: park ? undefined : parentId || undefined,
      recurrence_hours: recurrenceHours,
      certainty: type === 'proactive' ? certainty : undefined,
      intrinsic_impact: type === 'proactive' ? intrinsicImpact : undefined,
      status: 'active',
      unprocessed: park || !parentId,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField label="Habit" required>
        <input
          className={inputClass}
          placeholder="What do you want to repeat?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </FormField>

      {/* Type toggle */}
      <FormField label="Type" hint={type === 'proactive' ? 'Builds capability. Belongs to a bet.' : 'Maintains a floor. Belongs to an area.'}>
        <div className="flex gap-2">
          {(['proactive', 'maintenance'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-1.5 text-xs font-mono tracking-widest border transition-colors ${
                type === t
                  ? 'border-amber/50 bg-amber/10 text-amber'
                  : 'border-white/10 text-white/30 hover:text-white/60'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </FormField>

      {/* Park toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setPark(p => !p)}
          className={`w-8 h-4 rounded-full transition-colors ${park ? 'bg-amber/60' : 'bg-white/10'}`}
        >
          <div className={`w-3 h-3 mt-0.5 ml-0.5 rounded-full bg-white transition-transform ${park ? 'translate-x-4' : ''}`} />
        </div>
        <span className="text-xs font-mono text-white/40">Park for later (no parent yet)</span>
      </label>

      {!park && (
        <FormField label={type === 'proactive' ? 'Parent Bet' : 'Area'}>
          <select
            className={inputClass}
            value={parentId}
            onChange={e => setParentId(e.target.value)}
          >
            <option value="">— Select parent</option>
            {activeBets.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label="Recurrence">
        <div className="flex gap-2 flex-wrap">
          {RECURRENCE_PRESETS.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => setRecurrencePreset(p.hours)}
              className={`px-3 py-1 text-xs font-mono border transition-colors ${
                recurrencePreset === p.hours
                  ? 'border-amber/50 bg-amber/10 text-amber'
                  : 'border-white/10 text-white/30 hover:text-white/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {recurrencePreset === 0 && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number"
              min={1}
              className={inputClass + ' w-24'}
              value={customHours}
              onChange={e => setCustomHours(parseInt(e.target.value) || 24)}
            />
            <span className="text-xs font-mono text-white/30">hours</span>
          </div>
        )}
      </FormField>

      {type === 'proactive' && (
        <>
          <ScoreSlider label="Certainty" value={certainty} onChange={setCertainty} />
          <ScoreSlider label="Intrinsic Impact" value={intrinsicImpact} onChange={setIntrinsicImpact} />
        </>
      )}

      <button
        type="submit"
        disabled={!title.trim()}
        className="mt-2 w-full py-2 text-xs font-mono tracking-widest bg-teal/10 border border-teal/30
          text-teal hover:bg-teal/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {park ? 'PARK HABIT' : 'ADD HABIT'}
      </button>
    </form>
  )
}
