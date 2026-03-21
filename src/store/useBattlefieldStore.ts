import { create } from 'zustand'
import { loadState, saveState } from '@/lib/storage'
import type { PiecePosition, Zone } from '@/lib/types'

interface BattlefieldStore {
  positions: Record<string, { x: number; y: number }>
  zones: Zone[]
  zoom: number
  pan: { x: number; y: number }
  selectedId: string | null
  panelOpen: boolean
  panelTaskId: string | null
  setPosition: (id: string, x: number, y: number) => void
  setZoom: (z: number) => void
  setPan: (x: number, y: number) => void
  selectPiece: (id: string) => void
  deselect: () => void
  openTaskView: (taskId: string) => void
  closeTaskView: () => void
  upsertZone: (zone: Zone) => void
  deleteZone: (id: string) => void
}

const initial = loadState()

const initialPositions: Record<string, { x: number; y: number }> = {}
for (const p of initial.piecePositions) {
  initialPositions[p.id] = { x: p.x, y: p.y }
}

const persistPositions = (positions: Record<string, { x: number; y: number }>) => {
  const piecePositions: PiecePosition[] = Object.entries(positions).map(([id, pos]) => ({
    id,
    x: pos.x,
    y: pos.y,
  }))
  saveState({ ...loadState(), piecePositions })
}

export const useBattlefieldStore = create<BattlefieldStore>((set, get) => ({
  positions: initialPositions,
  zones: initial.zones,
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedId: null,
  panelOpen: false,
  panelTaskId: null,

  setPosition: (id, x, y) => {
    set((s) => {
      const positions = { ...s.positions, [id]: { x, y } }
      persistPositions(positions)
      return { positions }
    })
  },

  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2.0, zoom)) }),

  setPan: (x, y) => set({ pan: { x, y } }),

  selectPiece: (id) => set({ selectedId: id, panelOpen: true, panelTaskId: null }),

  deselect: () => set({ selectedId: null, panelOpen: false, panelTaskId: null }),

  openTaskView: (panelTaskId) => set({ panelTaskId }),

  closeTaskView: () => set({ panelTaskId: null }),

  upsertZone: (zone) => {
    set((s) => {
      const existing = s.zones.findIndex(z => z.id === zone.id)
      const zones = existing >= 0
        ? s.zones.map(z => z.id === zone.id ? zone : z)
        : [...s.zones, zone]
      saveState({ ...loadState(), zones })
      return { zones }
    })
  },

  deleteZone: (id) => {
    set((s) => {
      const zones = s.zones.filter(z => z.id !== id)
      saveState({ ...loadState(), zones })
      return { zones }
    })
  },

  getZones: () => get().zones,
}))
