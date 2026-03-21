import { createContext, useContext, useRef, useCallback } from 'react'
import { useBattlefieldStore } from '@/store/useBattlefieldStore'

// ─── Context ─────────────────────────────────────────────────────────────────

interface BattlefieldCtx {
  zoom: number
  pan: { x: number; y: number }
  containerRef: React.RefObject<HTMLDivElement | null>
  screenToWorld: (sx: number, sy: number) => { x: number; y: number }
}

const BattlefieldContext = createContext<BattlefieldCtx | null>(null)

export function useBattlefieldCtx() {
  const ctx = useContext(BattlefieldContext)
  if (!ctx) throw new Error('Must be inside BattlefieldCanvas')
  return ctx
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

const WORLD_W = 2400
const WORLD_H = 1800

interface BattlefieldCanvasProps {
  children: React.ReactNode
}

export function BattlefieldCanvas({ children }: BattlefieldCanvasProps) {
  const { zoom, pan, setZoom, setPan, deselect } = useBattlefieldStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (sx - rect.left - pan.x) / zoom,
      y: (sy - rect.top - pan.y) / zoom,
    }
  }, [pan, zoom])

  // Zoom toward cursor
  function onWheel(e: React.WheelEvent) {
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const cursorX = e.clientX - rect.left
    const cursorY = e.clientY - rect.top
    const factor = e.deltaY < 0 ? 1.08 : 0.93
    const newZoom = Math.max(0.3, Math.min(3, zoom * factor))
    const newPanX = cursorX - (cursorX - pan.x) * (newZoom / zoom)
    const newPanY = cursorY - (cursorY - pan.y) * (newZoom / zoom)
    setZoom(newZoom)
    setPan(newPanX, newPanY)
  }

  function onPointerDown(e: React.PointerEvent) {
    // Only pan when not clicking a piece or panel
    if ((e.target as HTMLElement).closest('[data-piece],[data-panel]')) return
    isPanning.current = true
    lastPointer.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
    deselect()
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isPanning.current) return
    const dx = e.clientX - lastPointer.current.x
    const dy = e.clientY - lastPointer.current.y
    setPan(pan.x + dx, pan.y + dy)
    lastPointer.current = { x: e.clientX, y: e.clientY }
  }

  function onPointerUp() {
    isPanning.current = false
  }

  return (
    <BattlefieldContext.Provider value={{ zoom, pan, containerRef, screenToWorld }}>
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden bg-canvas cursor-grab active:cursor-grabbing select-none"
        style={{ background: '#080d14' }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Canvas world */}
        <div
          style={{
            position: 'absolute',
            width: WORLD_W,
            height: WORLD_H,
            transformOrigin: '0 0',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {children}
        </div>

        {/* Zoom level indicator */}
        <div className="absolute bottom-4 right-4 text-xs font-mono text-white/20 pointer-events-none">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </BattlefieldContext.Provider>
  )
}
