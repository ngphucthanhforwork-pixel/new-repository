import { create } from 'zustand'
import { addHours } from 'date-fns'
import { loadState, saveState } from '@/lib/storage'
import type { Habit } from '@/lib/types'

const generateId = () => crypto.randomUUID()

interface HabitStore {
  habits: Habit[]
  addHabit: (data: Omit<Habit, 'id' | 'next_due_at'>) => Habit
  updateHabit: (id: string, data: Partial<Habit>) => void
  completeHabit: (id: string) => void
  deleteHabit: (id: string) => void
  getDueHabits: () => Habit[]
}

const initial = loadState()

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: initial.habits,

  addHabit: (data) => {
    const habit: Habit = {
      ...data,
      id: generateId(),
      next_due_at: new Date().toISOString(),
    }
    set((s) => {
      const habits = [...s.habits, habit]
      saveState({ ...loadState(), habits })
      return { habits }
    })
    return habit
  },

  updateHabit: (id, data) => {
    set((s) => {
      const habits = s.habits.map(h => h.id === id ? { ...h, ...data } : h)
      saveState({ ...loadState(), habits })
      return { habits }
    })
  },

  completeHabit: (id) => {
    const now = new Date()
    set((s) => {
      const habits = s.habits.map(h => {
        if (h.id !== id) return h
        return {
          ...h,
          status: 'dimmed' as const,
          last_completed_at: now.toISOString(),
          next_due_at: addHours(now, h.recurrence_hours).toISOString(),
        }
      })
      saveState({ ...loadState(), habits })
      return { habits }
    })
  },

  deleteHabit: (id) => {
    set((s) => {
      const habits = s.habits.filter(h => h.id !== id)
      saveState({ ...loadState(), habits })
      return { habits }
    })
  },

  getDueHabits: () => {
    const now = new Date()
    return get().habits.filter(h => h.status !== 'paused' && new Date(h.next_due_at) <= now)
  },
}))
