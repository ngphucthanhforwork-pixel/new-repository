import { useState } from 'react'
import { useBetStore } from '@/store/useBetStore'
import { FormField, inputClass, textareaClass } from '@/components/ui/FormField'
import { ScoreSlider } from '@/components/ui/ScoreSlider'

interface BetFormProps {
  onDone: () => void
}

export function BetForm({ onDone }: BetFormProps) {
  const { addBet, bets } = useBetStore()
  const [title, setTitle] = useState('')
  const [reward, setReward] = useState('')
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
      certainty,
      intrinsic_impact: intrinsicImpact,
      parent_bet_id: parentBetId || undefined,
      status: 'active',
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField label="Hypothesis" required>
        <input
          className={inputClass}
          placeholder="I believe doing X will create outcome Y..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </FormField>

      <FormField label="Reward" hint="The feeling or outcome you're betting on.">
        <textarea
          className={textareaClass}
          rows={2}
          placeholder="What does winning feel like?"
          value={reward}
          onChange={e => setReward(e.target.value)}
        />
      </FormField>

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
        <FormField label="Parent Bet" hint="Leave empty to make this a root bet (King).">
          <select
            className={inputClass}
            value={parentBetId}
            onChange={e => setParentBetId(e.target.value)}
          >
            <option value="">— Root bet (♚ King)</option>
            {activeBets.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </FormField>
      )}

      <button
        type="submit"
        disabled={!title.trim()}
        className="mt-2 w-full py-2 text-xs font-mono tracking-widest bg-amber/10 border border-amber/30
          text-amber hover:bg-amber/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        PLACE BET
      </button>
    </form>
  )
}
