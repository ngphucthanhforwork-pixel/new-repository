import type { Bet, Task, ChessRank, TaskCompletionLog } from './types'

export function computePriorityScore(certainty: number, intrinsicImpact: number): number {
  return certainty * intrinsicImpact
}

export function computeCumulativeScore(bet: Bet, allBets: Bet[]): number {
  const priority = computePriorityScore(bet.certainty, bet.intrinsic_impact)
  if (!bet.parent_bet_id) return priority
  const parent = allBets.find(b => b.id === bet.parent_bet_id)
  if (!parent) return priority
  return priority * computeCumulativeScore(parent, allBets)
}

export function computeChessRank(bet: Bet, allBets: Bet[]): ChessRank {
  if (!bet.parent_bet_id) return '♚'
  const childCount = allBets.filter(b => b.parent_bet_id === bet.id).length
  if (childCount === 0) return '♟'
  if (childCount <= 2) return '♞'
  if (childCount <= 4) return '♗'
  if (childCount <= 7) return '♜'
  return '♛'
}

export function computeTaskCumulativeScore(task: Task, allBets: Bet[]): number {
  const bet = allBets.find(b => b.id === task.bet_id)
  const betScore = bet ? computeCumulativeScore(bet, allBets) : 1
  return computePriorityScore(task.certainty, task.intrinsic_impact) * betScore
}

export function computeDeviationScore(log: Pick<TaskCompletionLog, 'outcome_deviation' | 'time_deviation'>): number {
  return (log.outcome_deviation + log.time_deviation) / 2
}

export function computeReviewPriority(
  log: Pick<TaskCompletionLog, 'outcome_deviation' | 'time_deviation' | 'effort_felt'>,
  taskCumulativeScore: number,
): number {
  return computeDeviationScore(log) * log.effort_felt * taskCumulativeScore
}
