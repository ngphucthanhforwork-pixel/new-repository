import { useBetStore } from '@/store/useBetStore'
import { useHabitStore } from '@/store/useHabitStore'
import { BetPiece } from './BetPiece'
import { HabitPiece } from './HabitPiece'

export function PiecesLayer() {
  const { bets } = useBetStore()
  const { habits } = useHabitStore()

  const visibleBets = bets.filter(b => b.status === 'active' || b.status === 'paused')
  const visibleHabits = habits.filter(h => h.status !== 'paused')

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      {visibleBets.map((bet, i) => (
        <BetPiece key={bet.id} betId={bet.id} index={i} />
      ))}
      {visibleHabits.map((habit, i) => (
        <HabitPiece key={habit.id} habitId={habit.id} index={i} />
      ))}
    </div>
  )
}
