import { useState } from 'react'
import { useBetStore } from '@/store/useBetStore'
import { FormField, inputClass, textareaClass } from '@/components/ui/FormField'
import { ScoreSlider } from '@/components/ui/ScoreSlider'

interface BetFormProps {
  onDone: () => void
  initialTitle?: string
}

export function BetForm({ onDone, initialTitle = '' }: BetFormProps) {
  const { addBet, bets } = useBetStore()
  const [title, setTitle] = useState(initialTitle)
  const [reward, setReward] = useState('')
  const [consequence, setConsequence] = useState('')
  const [certainty, setCertainty] = useState(0.5)
  const [intrinsicImpact, setIntrinsicImpact] = useState(0.5)
  const [parentBetId, setParentBetId] = useState('')

  const activeBets = bets.filter(b => b.status === 'active' || b.status === 'paused')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addBet({
      title: title.trim(),
      reward: reward.trim(),
      consequence: consequence.trim() || undefined,
      certainty,
      intrinsic_impact: intrinsicImpact,
      parent_bet_id: parentBetId || undefined,
      status: 'active',
    })
    onDone()
  }

  const sep = <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginLeft: -20, marginRight: -20 }} />

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      <FormField label="Hypothesis" required>
        <input
          className={inputClass}
          style={{ caretColor: '#e8a045' }}
          placeholder="I believe doing X will create outcome Y..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </FormField>

      {sep}

      <FormField label="🏆 Reward" hint="The feeling or outcome you're betting on.">
        <textarea
          className={textareaClass}
          style={{ caretColor: '#e8a045', minHeight: 56 }}
          placeholder="What does winning feel like?"
          value={reward}
          onChange={e => setReward(e.target.value)}
        />
      </FormField>

      <FormField label="✊ If Not" hint="What happens if you don't do this?">
        <textarea
          className={textareaClass}
          style={{ caretColor: '#e05555', minHeight: 56 }}
          placeholder="What do you lose by not acting?"
          value={consequence}
          onChange={e => setConsequence(e.target.value)}
        />
      </FormField>

      {sep}

      <ScoreSlider
        label="Certainty"
        value={certainty}
        onChange={setCertainty}
        hint="How confident are you this bet creates the reward?"
      />

      <ScoreSlider
        label="Intrinsic Impact"
        value={intrinsicImpact}
        onChange={setIntrinsicImpact}
        hint="Relative importance to sibling bets."
      />

      {activeBets.length > 0 && (
        <>
          {sep}
          <FormField label="Parent Goal" hint="Leave empty to make this a root bet (King).">
            <select
              className={inputClass}
              style={{ caretColor: '#e8a045', appearance: 'none', cursor: 'pointer',
                color: parentBetId ? 'rgba(232,160,69,0.8)' : 'rgba(255,255,255,0.25)' }}
              value={parentBetId}
              onChange={e => setParentBetId(e.target.value)}
            >
              <option value="" style={{ background: '#0d1525', color: 'rgba(255,255,255,0.4)' }}>
                ♚ Root goal (no parent)
              </option>
              {activeBets.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#0d1525', color: '#e8a045' }}>
                  {b.title}
                </option>
              ))}
            </select>
          </FormField>
        </>
      )}

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
        PLACE BET
      </button>
    </form>
  )
}
