import { create } from 'zustand'
import { loadState, saveState } from '@/lib/storage'
import type { Bet } from '@/lib/types'

const generateId = () => crypto.randomUUID()

interface BetStore {
  bets: Bet[]
  addBet: (data: Omit<Bet, 'id' | 'createdAt' | 'last_active_at'>) => Bet
  updateBet: (id: string, data: Partial<Bet>) => void
  deleteBet: (id: string) => void
  getBet: (id: string) => Bet | undefined
  getChildren: (parentId: string) => Bet[]
  getRoots: () => Bet[]
}

const initial = loadState()

export const useBetStore = create<BetStore>((set, get) => ({
  bets: initial.bets,

  addBet: (data) => {
    const bet: Bet = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    }
    set((s) => {
      const bets = [...s.bets, bet]
      saveState({ ...loadState(), bets })
      return { bets }
    })
    return bet
  },

  updateBet: (id, data) => {
    set((s) => {
      const bets = s.bets.map(b => b.id === id ? { ...b, ...data } : b)
      saveState({ ...loadState(), bets })
      return { bets }
    })
  },

  deleteBet: (id) => {
    set((s) => {
      const bets = s.bets.filter(b => b.id !== id)
      saveState({ ...loadState(), bets })
      return { bets }
    })
  },

  getBet: (id) => get().bets.find(b => b.id === id),
  getChildren: (parentId) => get().bets.filter(b => b.parent_bet_id === parentId),
  getRoots: () => get().bets.filter(b => !b.parent_bet_id),
}))
