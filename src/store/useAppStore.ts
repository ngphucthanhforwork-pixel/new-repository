import { create } from 'zustand'
import type { AppMode, PlanStage } from '@/lib/types'

export type CardEntityType = 'task' | 'bet' | 'habit'

interface AppStore {
  mode: AppMode
  planStage: PlanStage
  activeTaskId: string | null
  // Universal card overlay — source of truth
  cardItem: { type: CardEntityType; id: string } | null
  setMode: (mode: AppMode) => void
  setPlanStage: (stage: PlanStage) => void
  setActiveTask: (taskId: string | null) => void
  openCard: (type: CardEntityType, id: string) => void
  closeCard: () => void
  // Backwards-compat aliases (task-specific)
  openTaskCard: (taskId: string) => void
  closeTaskCard: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  mode: 'plan',
  planStage: 'capture',
  activeTaskId: null,
  cardItem: null,
  setMode: (mode) => set({ mode }),
  setPlanStage: (planStage) => set({ planStage }),
  setActiveTask: (activeTaskId) => set({ activeTaskId }),
  openCard: (type, id) => set({ cardItem: { type, id } }),
  closeCard: () => set({ cardItem: null }),
  openTaskCard: (id) => set({ cardItem: { type: 'task', id } }),
  closeTaskCard: () => set({ cardItem: null }),
}))
