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
  { label: 'Daily',    hours: 24  },
  { label: '2×/week', hours: 84  },
  { label: 'Weekly',  hours: 168 },
  { label: 'Custom',  hours: 0   },
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

  const sep = <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginLeft: -20, marginRight: -20 }} />

  const toggleBtnStyle = (active: boolean, accent = '#e8a045'): React.CSSProperties => ({
    flex: 1,
    padding: '4px 8px',
    fontFamily: 'inherit',
    fontSize: 10,
    letterSpacing: '0.1em',
    border: `1px solid ${active ? `${accent}55` : 'rgba(255,255,255,0.08)'}`,
    background: active ? `${accent}14` : 'transparent',
    color: active ? accent : 'rgba(255,255,255,0.28)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  })

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      <FormField label="Habit" required>
        <input
          className={inputClass}
          style={{ caretColor: '#4ab8b8' }}
          placeholder="What do you want to repeat?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </FormField>

      {sep}

      {/* Type toggle */}
      <FormField label="Type" hint={type === 'proactive' ? 'Builds capability. Belongs to a bet.' : 'Maintains a floor. Belongs to an area.'}>
        <div className="flex gap-1">
          {(['proactive', 'maintenance'] as const).map(t => (
            <button key={t} type="button" onClick={() => setType(t)} style={toggleBtnStyle(type === t, '#4ab8b8')}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </FormField>

      {sep}

      {/* Park toggle */}
      <button type="button" onClick={() => setPark(p => !p)} className="flex items-center gap-3 text-left">
        <div
          className="relative shrink-0 transition-colors"
          style={{ width: 28, height: 14, borderRadius: 7, background: park ? 'rgba(74,184,184,0.5)' : 'rgba(255,255,255,0.1)' }}
        >
          <div
            className="absolute top-0.5 left-0.5 rounded-full bg-white transition-transform"
            style={{ width: 11, height: 11, transform: park ? 'translateX(14px)' : 'none' }}
          />
        </div>
        <span className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
          Park for later (no parent yet)
        </span>
      </button>

      {!park && (
        <FormField label={type === 'proactive' ? 'Parent Bet' : 'Area'}>
          <select
            className={inputClass}
            style={{
              caretColor: '#4ab8b8', appearance: 'none', cursor: 'pointer',
              color: parentId ? 'rgba(232,160,69,0.8)' : 'rgba(255,255,255,0.25)',
            }}
            value={parentId}
            onChange={e => setParentId(e.target.value)}
          >
            <option value="" style={{ background: '#0d1525', color: 'rgba(255,255,255,0.4)' }}>— Select parent</option>
            {activeBets.map(b => (
              <option key={b.id} value={b.id} style={{ background: '#0d1525', color: '#e8a045' }}>{b.title}</option>
            ))}
          </select>
        </FormField>
      )}

      {sep}

      {/* Recurrence */}
      <FormField label="Recurrence">
        <div className="flex gap-1 flex-wrap">
          {RECURRENCE_PRESETS.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => setRecurrencePreset(p.hours)}
              style={toggleBtnStyle(recurrencePreset === p.hours, '#4ab8b8')}
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
              className={inputClass}
              style={{ caretColor: '#4ab8b8', width: 72 }}
              value={customHours}
              onChange={e => setCustomHours(parseInt(e.target.value) || 24)}
            />
            <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>hours</span>
          </div>
        )}
      </FormField>

      {type === 'proactive' && (
        <>
          {sep}
          <ScoreSlider label="Certainty" value={certainty} onChange={setCertainty} />
          <ScoreSlider label="Intrinsic Impact" value={intrinsicImpact} onChange={setIntrinsicImpact} />
        </>
      )}

      <button
        type="submit"
        disabled={!title.trim()}
        className="mt-1 w-full py-2.5 font-mono text-xs tracking-widest transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        style={{
          background: 'rgba(74,184,184,0.07)',
          border: '1px solid rgba(74,184,184,0.3)',
          color: '#4ab8b8',
        }}
        onMouseEnter={e => { if (title.trim()) e.currentTarget.style.background = 'rgba(74,184,184,0.16)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,184,184,0.07)' }}
      >
        {park ? 'PARK HABIT' : 'ADD HABIT'}
      </button>
    </form>
  )
}
