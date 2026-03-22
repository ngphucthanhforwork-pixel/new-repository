import { create } from 'zustand'
import { loadState, saveState } from '@/lib/storage'
import type { TimeSession, TaskCompletionLog, KolbEntry } from '@/lib/types'

const generateId = () => crypto.randomUUID()

interface SessionStore {
  sessions: TimeSession[]
  completionLogs: TaskCompletionLog[]
  kolbEntries: KolbEntry[]
  addSession: (data: Omit<TimeSession, 'id'>) => TimeSession
  updateSession: (id: string, data: Partial<TimeSession>) => void
  addCompletionLog: (data: Omit<TaskCompletionLog, 'id' | 'createdAt'>) => TaskCompletionLog
  addKolbEntry: (data: Omit<KolbEntry, 'id' | 'createdAt'>) => KolbEntry
  getReviewBacklog: () => TaskCompletionLog[]
  getLastSession: () => TimeSession | undefined
}

const initial = loadState()

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: initial.sessions,
  completionLogs: initial.completionLogs,
  kolbEntries: initial.kolbEntries,

  addSession: (data) => {
    const session: TimeSession = { ...data, id: generateId() }
    set((s) => {
      const sessions = [...s.sessions, session]
      saveState({ ...loadState(), sessions })
      return { sessions }
    })
    return session
  },

  updateSession: (id, data) => {
    set((s) => {
      const sessions = s.sessions.map(s => s.id === id ? { ...s, ...data } : s)
      saveState({ ...loadState(), sessions })
      return { sessions }
    })
  },

  addCompletionLog: (data) => {
    const log: TaskCompletionLog = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    set((s) => {
      const completionLogs = [...s.completionLogs, log]
      saveState({ ...loadState(), completionLogs })
      return { completionLogs }
    })
    return log
  },

  addKolbEntry: (data) => {
    const entry: KolbEntry = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    set((s) => {
      const kolbEntries = [...s.kolbEntries, entry]
      saveState({ ...loadState(), kolbEntries })
      return { kolbEntries }
    })
    return entry
  },

  getReviewBacklog: () =>
    get().completionLogs
      .filter(l => l.review_decision === 'yes')
      .sort((a, b) => b.review_priority - a.review_priority),

  getLastSession: () => {
    const s = get().sessions
    return s.length > 0 ? s[s.length - 1] : undefined
  },
}))
