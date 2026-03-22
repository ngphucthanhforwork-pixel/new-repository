// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Bet {
  id: string
  title: string
  reward: string
  consequence?: string       // what happens if you don't
  certainty: number          // 0–1
  intrinsic_impact: number   // 0–1
  parent_bet_id?: string
  status: 'active' | 'paused' | 'killed' | 'completed'
  locked?: boolean           // locked into queue, cannot be moved
  last_active_at: string     // ISO timestamp
  createdAt: string
}

export interface Task {
  id: string
  title: string
  bet_id?: string            // optional when parked/unprocessed
  objectives: string[]
  objectives_done?: boolean[] // parallel to objectives, checked state
  reward?: string            // what you win if done
  consequence?: string       // cost if skipped
  start_date?: string        // ISO date string (YYYY-MM-DD)
  due_date?: string          // ISO date string (YYYY-MM-DD)
  estimated_time: number     // minutes
  certainty: number          // 0–1
  intrinsic_impact: number   // 0–1
  status: 'backlog' | 'locked' | 'queued' | 'scheduled' | 'executing' | 'done'
  unprocessed?: boolean      // captured without bet assignment
  queued_at?: string         // ISO timestamp, set when added to micro queue
  completed_at?: string      // ISO timestamp
  notes?: string             // free-form notepad content
  createdAt: string
}

export interface Habit {
  id: string
  title: string
  type: 'proactive' | 'maintenance'
  parent_id?: string         // bet ID or area ID; optional when parked
  recurrence_hours: number   // interval between activations
  certainty?: number         // proactive only
  intrinsic_impact?: number  // proactive only
  status: 'active' | 'dimmed' | 'paused'
  unprocessed?: boolean      // captured without parent assignment
  last_completed_at?: string
  next_due_at: string
}

export interface Area {
  id: string
  title: string
  description?: string
  color?: string             // hex — for Battlefield zone tinting
}

export interface TimeSession {
  id: string
  type: 'work' | 'break' | 'kolb' | 'blank'
  parent_type: 'task' | 'habit'
  parent_id: string
  started_at: string
  ended_at?: string
  // work extras
  outcomes_shipped?: string
  outcome_quality?: number   // 0–1
  energy_remaining?: number  // 0–1
  whats_remaining?: string
  // break extras
  break_type?: string
  intentionality?: number    // 0–1
  energy_before?: number     // 0–1
  energy_after?: number      // 0–1
  note?: string
}

export interface TaskCompletionLog {
  id: string
  task_id: string
  objectives_vs_outcomes: string
  outcome_deviation: number  // 0–1
  estimated_time: number     // minutes
  actual_time: number        // minutes
  time_deviation: number     // 0–1
  effort_felt: number        // 0–1
  effort_notes?: string
  review_decision: 'yes' | 'no'
  // computed
  deviation_score: number    // avg(outcome_deviation, time_deviation)
  review_priority: number    // deviation_score × effort_felt × task.cumulative_score
  createdAt: string
}

export interface KolbEntry {
  id: string
  task_completion_log_id: string
  experience: string
  reflection: string
  abstraction: string
  experiment: string
  output_type: 'new_bet' | 'update_confidence' | 'insight_only'
  output_ref?: string        // bet ID if linked
  confidence_note?: string   // note explaining confidence update
  insight_quality: number    // 0–1
  createdAt: string
}

// ─── Battlefield Canvas ───────────────────────────────────────────────────────

export interface PiecePosition {
  id: string
  x: number
  y: number
}

export interface Zone {
  id: string
  title: string
  color: string              // hex
  points: [number, number][] // polygon vertices in canvas coords
}

// ─── App State (full persisted shape) ────────────────────────────────────────

export interface AppState {
  bets: Bet[]
  tasks: Task[]
  habits: Habit[]
  areas: Area[]
  sessions: TimeSession[]
  completionLogs: TaskCompletionLog[]
  kolbEntries: KolbEntry[]
  piecePositions: PiecePosition[]
  zones: Zone[]
  grandQueue: string[]       // ordered bet IDs
  microQueue: string[]       // ordered task IDs
}

// ─── Computed / UI types ──────────────────────────────────────────────────────

export type ChessRank = '♟' | '♞' | '♗' | '♜' | '♛' | '♚'

export type DecayState = 'active' | 'aging' | 'decaying' | 'dead'

export type RoadDecayState = 'fresh' | 'aging' | 'dead'

export type AppMode = 'plan' | 'execute' | 'break' | 'review' | 'heatmap'

export type PlanStage = 'capture' | 'battlefield' | 'campaign'
