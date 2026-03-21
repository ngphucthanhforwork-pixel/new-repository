import { differenceInDays } from 'date-fns'
import type { Bet, DecayState, RoadDecayState } from './types'

// Bet piece decay thresholds (days of inactivity)
const AGING_DAYS = 3
const DECAYING_DAYS = 7
const DEAD_DAYS = 14

// Road decay thresholds (days since last stage transition)
const ROAD_AGING_DAYS = 3
const ROAD_DEAD_DAYS = 7

export function getBetDecayState(bet: Bet): DecayState {
  const days = differenceInDays(new Date(), new Date(bet.last_active_at))
  if (days >= DEAD_DAYS) return 'dead'
  if (days >= DECAYING_DAYS) return 'decaying'
  if (days >= AGING_DAYS) return 'aging'
  return 'active'
}

export function decayOpacity(state: DecayState): number {
  switch (state) {
    case 'active': return 1.0
    case 'aging': return 0.6
    case 'decaying': return 0.3
    case 'dead': return 0.1
  }
}

export function getRoadDecayState(lastTransitionAt: string): RoadDecayState {
  const days = differenceInDays(new Date(), new Date(lastTransitionAt))
  if (days >= ROAD_DEAD_DAYS) return 'dead'
  if (days >= ROAD_AGING_DAYS) return 'aging'
  return 'fresh'
}
