import { create } from 'zustand'
import { loadState, saveState } from '@/lib/storage'
import type { Task } from '@/lib/types'

const generateId = () => crypto.randomUUID()

interface TaskStore {
  tasks: Task[]
  addTask: (data: Omit<Task, 'id' | 'createdAt'>) => Task
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTask: (id: string) => Task | undefined
  getTasksByBet: (betId: string) => Task[]
}

const initial = loadState()

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: initial.tasks,

  addTask: (data) => {
    const task: Task = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    set((s) => {
      const tasks = [...s.tasks, task]
      saveState({ ...loadState(), tasks })
      return { tasks }
    })
    return task
  },

  updateTask: (id, data) => {
    set((s) => {
      const tasks = s.tasks.map(t => t.id === id ? { ...t, ...data } : t)
      saveState({ ...loadState(), tasks })
      return { tasks }
    })
  },

  deleteTask: (id) => {
    set((s) => {
      const tasks = s.tasks.filter(t => t.id !== id)
      saveState({ ...loadState(), tasks })
      return { tasks }
    })
  },

  getTask: (id) => get().tasks.find(t => t.id === id),
  getTasksByBet: (betId) => get().tasks.filter(t => t.bet_id === betId),
}))
