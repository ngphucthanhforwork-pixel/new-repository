import { create } from 'zustand'
import type { AppMode, PlanStage } from '@/lib/types'

interface AppStore {
  mode: AppMode
  planStage: PlanStage
  activeTaskId: string | null
  setMode: (mode: AppMode) => void
  setPlanStage: (stage: PlanStage) => void
  setActiveTask: (taskId: string | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  mode: 'plan',
  planStage: 'capture',
  activeTaskId: null,
  setMode: (mode) => set({ mode }),
  setPlanStage: (planStage) => set({ planStage }),
  setActiveTask: (activeTaskId) => set({ activeTaskId }),
}))
