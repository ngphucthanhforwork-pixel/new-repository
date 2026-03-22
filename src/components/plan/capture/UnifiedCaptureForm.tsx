import { useState } from 'react'
import { useBetStore } from '@/store/useBetStore'
import { useTaskStore } from '@/store/useTaskStore'
import { useHabitStore } from '@/store/useHabitStore'
import { useAreaStore } from './AreaForm'
import { ScoreSlider } from '@/components/ui/ScoreSlider'

// ─── Types ────────────────────────────────────────────────────────────────────

type EntityType = 'bet' | 'task' | 'habit' | 'area'

const TYPE_CFG: Record<EntityType, {
  label: string
  icon: string
  accent: string
  ctaBase: string
  ctaParked?: string
}> = {
  bet:   { label: 'BET',   icon: '♚', accent: '#e8a045', ctaBase: 'PLACE BET'  },
  task:  { label: 'TASK',  icon: '◈', accent: '#e8a045', ctaBase: 'ADD TASK',  ctaParked: 'PARK TASK'  },
  habit: { label: 'HABIT', icon: '↻', accent: '#4ab8b8', ctaBase: 'ADD HABIT', ctaParked: 'PARK HABIT' },
  area:  { label: 'AREA',  icon: '▦', accent: 'rgba(255,255,255,0.45)', ctaBase: 'ADD AREA' },
}

const TYPES = Object.keys(TYPE_CFG) as EntityType[]

const RECURRENCE_PRESETS = [
  { label: 'Daily',    hours: 24  },
  { label: '2×/week', hours: 84  },
  { label: 'Weekly',  hours: 168 },
]

// ─── Shared field styles ──────────────────────────────────────────────────────

const fieldLabel: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 9,
  letterSpacing: '0.12em',
  color: 'rgba(255,255,255,0.28)',
  textTransform: 'uppercase',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: 12,
  color: 'rgba(255,255,255,0.8)',
  caretColor: '#e8a045',
  padding: '6px 0',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'none',
  lineHeight: 1.6,
  minHeight: 48,
}

const Sep = () => (
  <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 -24px' }} />
)

// ─── UnifiedCaptureForm ───────────────────────────────────────────────────────

interface UnifiedCaptureFormProps {
  onDone: () => void
  initialTitle?: string
}

export function UnifiedCaptureForm({ onDone, initialTitle = '' }: UnifiedCaptureFormProps) {
  const { addBet, bets } = useBetStore()
  const { addTask } = useTaskStore()
  const { addHabit } = useHabitStore()
  const { addArea } = useAreaStore()

  // ── Common ─────────────────────────────────────────────────────────────────
  const [type, setType] = useState<EntityType>('task')
  const [title, setTitle] = useState(initialTitle)
  const [parentId, setParentId] = useState('')
  const [certainty, setCertainty] = useState(0.5)
  const [impact, setImpact] = useState(0.5)
  const [park, setPark] = useState(false)

  // ── BET-specific ───────────────────────────────────────────────────────────
  const [reward, setReward] = useState('')
  const [consequence, setConsequence] = useState('')

  // ── TASK-specific ──────────────────────────────────────────────────────────
  const [objectives, setObjectives] = useState<string[]>([''])
  const [estTime, setEstTime] = useState(30)

  // ── HABIT-specific ─────────────────────────────────────────────────────────
  const [habitType, setHabitType] = useState<'proactive' | 'maintenance'>('proactive')
  const [recurrence, setRecurrence] = useState(24)
  const [customHours, setCustomHours] = useState(24)

  // ── AREA-specific ──────────────────────────────────────────────────────────
  const [description, setDescription] = useState('')

  const cfg = TYPE_CFG[type]
  const activeBets = bets.filter(b => b.status === 'active' || b.status === 'paused')
  const showScoring = type === 'bet' || type === 'task' || (type === 'habit' && habitType === 'proactive')
  const showParent = type !== 'area'
  const isParked = park && (type === 'task' || type === 'habit')
  const finalHours = recurrence === 0 ? customHours : recurrence

  function switchType(t: EntityType) {
    setType(t)
    setPark(false)
  }

  function addObjective() { setObjectives(p => [...p, '']) }
  function updateObjective(i: number, v: string) { setObjectives(p => p.map((o, idx) => idx === i ? v : o)) }
  function removeObjective(i: number) { setObjectives(p => p.filter((_, idx) => idx !== i)) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return

    if (type === 'bet') {
      addBet({
        title: t, reward: reward.trim(), consequence: consequence.trim() || undefined,
        certainty, intrinsic_impact: impact,
        parent_bet_id: parentId || undefined, status: 'active',
      })
    } else if (type === 'task') {
      addTask({
        title: t,
        bet_id: isParked ? undefined : parentId || undefined,
        objectives: objectives.filter(o => o.trim()),
        estimated_time: estTime, certainty, intrinsic_impact: impact,
        status: 'queued', unprocessed: isParked || !parentId,
      })
    } else if (type === 'habit') {
      addHabit({
        title: t, type: habitType,
        parent_id: isParked ? undefined : parentId || undefined,
        recurrence_hours: finalHours,
        certainty: habitType === 'proactive' ? certainty : undefined,
        intrinsic_impact: habitType === 'proactive' ? impact : undefined,
        status: 'active', unprocessed: isParked || !parentId,
      })
    } else if (type === 'area') {
      addArea({ title: t, description: description.trim() || undefined })
    }

    onDone()
  }

  // ─── Toggle button helper ──────────────────────────────────────────────────
  function ToggleBtn({ active, label, onClick, accent = '#e8a045' }: {
    active: boolean; label: string; onClick: () => void; accent?: string
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          flex: 1,
          padding: '4px 6px',
          fontFamily: 'inherit',
          fontSize: 10,
          letterSpacing: '0.08em',
          border: `1px solid ${active ? `${accent}55` : 'rgba(255,255,255,0.08)'}`,
          background: active ? `${accent}14` : 'transparent',
          color: active ? accent : 'rgba(255,255,255,0.28)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {label}
      </button>
    )
  }

  // ─── Field wrapper ─────────────────────────────────────────────────────────
  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div>
        <div style={fieldLabel}>{label}</div>
        {children}
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full"
      style={{ background: '#07101a' }}
    >
      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-5 px-6 py-5">

        {/* TYPE SWITCHER */}
        <div className="flex gap-1">
          {TYPES.map(t => {
            const c = TYPE_CFG[t]
            const active = type === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => switchType(t)}
                className="flex-1 flex flex-col items-center py-2 transition-all"
                style={{
                  border: `1px solid ${active ? `${c.accent}55` : 'rgba(255,255,255,0.07)'}`,
                  background: active ? `${c.accent}10` : 'transparent',
                  color: active ? c.accent : 'rgba(255,255,255,0.2)',
                }}
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>{c.icon}</span>
                <span style={{ fontFamily: 'inherit', fontSize: 9, letterSpacing: '0.1em', marginTop: 4 }}>
                  {c.label}
                </span>
              </button>
            )
          })}
        </div>

        <Sep />

        {/* TITLE — always present */}
        <Field label="Title">
          <input
            style={{ ...inputStyle, caretColor: cfg.accent, fontSize: 14 }}
            placeholder={
              type === 'bet'   ? 'I believe doing X will create outcome Y...' :
              type === 'task'  ? 'What needs to get done?' :
              type === 'habit' ? 'What do you want to repeat?' :
                                 'e.g. Health, Sleep, Finance'
            }
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </Field>

        {/* PARENT — all types except area */}
        {showParent && (
          <>
            <Sep />
            {/* Park toggle for task/habit */}
            {(type === 'task' || type === 'habit') && (
              <button
                type="button"
                onClick={() => setPark(p => !p)}
                className="flex items-center gap-2.5 text-left"
              >
                <div style={{
                  position: 'relative', width: 28, height: 14, borderRadius: 7, flexShrink: 0,
                  background: park ? `${cfg.accent}55` : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.15s',
                }}>
                  <div style={{
                    position: 'absolute', top: 1.5, left: 1.5, width: 11, height: 11,
                    borderRadius: '50%', background: 'white',
                    transform: park ? 'translateX(14px)' : 'none', transition: 'transform 0.15s',
                  }} />
                </div>
                <span style={{ fontFamily: 'inherit', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                  Park — no parent yet
                </span>
              </button>
            )}

            {!park && (
              <Field label={type === 'bet' ? 'Parent goal' : type === 'habit' ? 'Parent bet / area' : 'Parent bet'}>
                <select
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const,
                    color: parentId ? 'rgba(232,160,69,0.85)' : 'rgba(255,255,255,0.22)' }}
                  value={parentId}
                  onChange={e => setParentId(e.target.value)}
                >
                  <option value="" style={{ background: '#0d1525', color: 'rgba(255,255,255,0.4)' }}>
                    {type === 'bet' ? '♚ Root goal (no parent)' : '— No parent assigned'}
                  </option>
                  {activeBets.map(b => (
                    <option key={b.id} value={b.id} style={{ background: '#0d1525', color: '#e8a045' }}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </>
        )}

        <Sep />

        {/* ── TYPE-SPECIFIC SECTION ──────────────────────────────────────── */}

        {/* BET: reward + consequence */}
        {type === 'bet' && (
          <>
            <Field label="🏆 Reward">
              <textarea
                style={{ ...textareaStyle, caretColor: '#e8a045' }}
                placeholder="What does winning feel like?"
                value={reward}
                onChange={e => setReward(e.target.value)}
              />
            </Field>
            <Field label="✊ If Not">
              <textarea
                style={{ ...textareaStyle, caretColor: '#e05555' }}
                placeholder="What do you lose by not acting?"
                value={consequence}
                onChange={e => setConsequence(e.target.value)}
              />
            </Field>
          </>
        )}

        {/* TASK: objectives + estimated time */}
        {type === 'task' && (
          <>
            <Field label="Objectives">
              <div className="flex flex-col gap-2">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span style={{ fontFamily: 'inherit', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>□</span>
                    <input
                      style={{ ...inputStyle, flex: 1, caretColor: '#e8a045' }}
                      placeholder={`Objective ${i + 1}`}
                      value={obj}
                      onChange={e => updateObjective(i, e.target.value)}
                    />
                    {objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeObjective(i)}
                        style={{ fontFamily: 'inherit', fontSize: 11, color: 'rgba(255,255,255,0.2)',
                          background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                      >✕</button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addObjective}
                  style={{ fontFamily: 'inherit', fontSize: 10, color: 'rgba(255,255,255,0.22)',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    padding: '2px 0 0 18px', letterSpacing: '0.05em' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(232,160,69,0.65)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.22)')}
                >+ ADD OBJECTIVE</button>
              </div>
            </Field>
            <Field label="Estimated time">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={5}
                  step={5}
                  style={{ ...inputStyle, width: 60, caretColor: '#e8a045' }}
                  value={estTime}
                  onChange={e => setEstTime(parseInt(e.target.value) || 30)}
                />
                <span style={{ fontFamily: 'inherit', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>min</span>
                <div className="flex gap-1 ml-auto">
                  {[15, 25, 45, 90].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEstTime(t)}
                      style={{
                        fontFamily: 'inherit', fontSize: 9, padding: '2px 5px', cursor: 'pointer',
                        border: `1px solid ${estTime === t ? 'rgba(232,160,69,0.35)' : 'rgba(255,255,255,0.07)'}`,
                        background: estTime === t ? 'rgba(232,160,69,0.08)' : 'transparent',
                        color: estTime === t ? '#e8a045' : 'rgba(255,255,255,0.22)',
                        transition: 'all 0.12s',
                      }}
                    >{t}m</button>
                  ))}
                </div>
              </div>
            </Field>
          </>
        )}

        {/* HABIT: proactive/maintenance toggle + recurrence */}
        {type === 'habit' && (
          <>
            <Field label="Type">
              <div className="flex gap-1">
                <ToggleBtn active={habitType === 'proactive'}   label="PROACTIVE"   onClick={() => setHabitType('proactive')}   accent="#4ab8b8" />
                <ToggleBtn active={habitType === 'maintenance'} label="MAINTENANCE" onClick={() => setHabitType('maintenance')} accent="#4ab8b8" />
              </div>
            </Field>
            <Field label="Recurrence">
              <div className="flex gap-1 flex-wrap">
                {RECURRENCE_PRESETS.map(p => (
                  <ToggleBtn
                    key={p.hours}
                    active={recurrence === p.hours}
                    label={p.label}
                    onClick={() => setRecurrence(p.hours)}
                    accent="#4ab8b8"
                  />
                ))}
                <ToggleBtn active={recurrence === 0} label="Custom" onClick={() => setRecurrence(0)} accent="#4ab8b8" />
              </div>
              {recurrence === 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min={1}
                    style={{ ...inputStyle, width: 60, caretColor: '#4ab8b8' }}
                    value={customHours}
                    onChange={e => setCustomHours(parseInt(e.target.value) || 24)}
                  />
                  <span style={{ fontFamily: 'inherit', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>hours</span>
                </div>
              )}
            </Field>
          </>
        )}

        {/* AREA: description */}
        {type === 'area' && (
          <Field label="Description" >
            <textarea
              style={{ ...textareaStyle, caretColor: 'rgba(255,255,255,0.5)', minHeight: 72 }}
              placeholder="Minimum standards, non-negotiables..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </Field>
        )}

        {/* ── SCORING ──────────────────────────────────────────────────────── */}
        {showScoring && (
          <>
            <Sep />
            <ScoreSlider label="Certainty"        value={certainty} onChange={setCertainty} />
            <ScoreSlider label="Intrinsic Impact" value={impact}    onChange={setImpact}    />
          </>
        )}
      </div>

      {/* ── Submit footer ────────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-6 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full py-2.5 font-mono text-xs tracking-widest transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          style={{
            background: `${cfg.accent}10`,
            border: `1px solid ${cfg.accent}44`,
            color: cfg.accent,
          }}
          onMouseEnter={e => { if (title.trim()) e.currentTarget.style.background = `${cfg.accent}20` }}
          onMouseLeave={e => { e.currentTarget.style.background = `${cfg.accent}10` }}
        >
          {isParked && cfg.ctaParked ? cfg.ctaParked : cfg.ctaBase}
        </button>
      </div>
    </form>
  )
}
