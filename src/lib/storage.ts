import type { AppState } from './types'

const STORAGE_KEY = 'tbd_app_state'

const DEFAULT_STATE: AppState = {
  bets: [],
  tasks: [],
  habits: [],
  areas: [],
  sessions: [],
  completionLogs: [],
  kolbEntries: [],
  piecePositions: [],
  zones: [
    {
      id: 'zone-work',
      title: 'Work',
      color: '#e8a045',
      points: [[100, 100], [500, 100], [500, 400], [100, 400]],
    },
    {
      id: 'zone-health',
      title: 'Health',
      color: '#4ab8b0',
      points: [[600, 100], [1000, 100], [1000, 400], [600, 400]],
    },
    {
      id: 'zone-relationships',
      title: 'Relationships',
      color: '#a855f7',
      points: [[100, 500], [500, 500], [500, 800], [100, 800]],
    },
    {
      id: 'zone-learning',
      title: 'Learning',
      color: '#3b82f6',
      points: [[600, 500], [1000, 500], [1000, 800], [600, 800]],
    },
  ],
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    return { ...DEFAULT_STATE, ...JSON.parse(raw) as Partial<AppState> }
  } catch {
    return DEFAULT_STATE
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
