import { create } from 'zustand'
import { loadState, saveState } from '@/lib/storage'

interface CampaignStore {
  grandQueue: string[]  // ordered bet IDs
  microQueue: string[]  // ordered task IDs

  addToGrand: (betId: string) => void
  removeFromGrand: (betId: string) => void
  moveInGrand: (fromIdx: number, toIdx: number) => void

  addToMicro: (taskId: string) => void
  removeFromMicro: (taskId: string) => void
  moveInMicro: (fromIdx: number, toIdx: number) => void

  pruneQueues: (validBetIds: string[], validTaskIds: string[]) => void
}

const initial = loadState()

function move<T>(arr: T[], from: number, to: number): T[] {
  const out = [...arr]
  const [item] = out.splice(from, 1)
  out.splice(to, 0, item)
  return out
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  grandQueue: initial.grandQueue,
  microQueue: initial.microQueue,

  addToGrand: (betId) => {
    set((s) => {
      if (s.grandQueue.includes(betId)) return s
      const grandQueue = [...s.grandQueue, betId]
      saveState({ ...loadState(), grandQueue })
      return { grandQueue }
    })
  },

  removeFromGrand: (betId) => {
    set((s) => {
      const grandQueue = s.grandQueue.filter(id => id !== betId)
      saveState({ ...loadState(), grandQueue })
      return { grandQueue }
    })
  },

  moveInGrand: (fromIdx, toIdx) => {
    set((s) => {
      const grandQueue = move(s.grandQueue, fromIdx, toIdx)
      saveState({ ...loadState(), grandQueue })
      return { grandQueue }
    })
  },

  addToMicro: (taskId) => {
    set((s) => {
      if (s.microQueue.includes(taskId)) return s
      const microQueue = [...s.microQueue, taskId]
      saveState({ ...loadState(), microQueue })
      return { microQueue }
    })
  },

  removeFromMicro: (taskId) => {
    set((s) => {
      const microQueue = s.microQueue.filter(id => id !== taskId)
      saveState({ ...loadState(), microQueue })
      return { microQueue }
    })
  },

  moveInMicro: (fromIdx, toIdx) => {
    set((s) => {
      const microQueue = move(s.microQueue, fromIdx, toIdx)
      saveState({ ...loadState(), microQueue })
      return { microQueue }
    })
  },

  // Remove stale IDs (for when bets/tasks are deleted)
  pruneQueues: (validBetIds, validTaskIds) => {
    set((s) => {
      const grandQueue = s.grandQueue.filter(id => validBetIds.includes(id))
      const microQueue = s.microQueue.filter(id => validTaskIds.includes(id))
      saveState({ ...loadState(), grandQueue, microQueue })
      return { grandQueue, microQueue }
    })
  },
}))
