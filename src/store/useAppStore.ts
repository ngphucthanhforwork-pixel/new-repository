import { create } from 'zustand'
import type { AppMode, PlanStage } from '@/lib/types'

interface AppStore {
  mode: AppMode
  planStage: PlanStage
  activeTaskId: string | null
  taskCardId: string | null      // global task card overlay
  setMode: (mode: AppMode) => void
  setPlanStage: (stage: PlanStage) => void
  setActiveTask: (taskId: string | null) => void
  openTaskCard: (taskId: string) => void
  closeTaskCard: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  mode: 'plan',
  planStage: 'capture',
  activeTaskId: null,
  taskCardId: null,
  setMode: (mode) => set({ mode }),
  setPlanStage: (planStage) => set({ planStage }),
  setActiveTask: (activeTaskId) => set({ activeTaskId }),
  openTaskCard: (taskCardId) => set({ taskCardId }),
  closeTaskCard: () => set({ taskCardId: null }),
}))
