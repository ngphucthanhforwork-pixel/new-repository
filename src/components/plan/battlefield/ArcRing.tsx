import { useRef } from 'react'
import { arcPath, arcBackgroundPath, arcHandlePos, angleToIntrinsicImpact } from '@/lib/battlefield'
import { useBattlefieldCtx } from './BattlefieldCanvas'

interface ArcRingProps {
  cx: number
  cy: number
  radius: number
  intrinsicImpact: number
  visible: boolean
  onUpdate: (value: number) => void
}

export function ArcRing({ cx, cy, radius, intrinsicImpact, visible, onUpdate }: ArcRingProps) {
  const { zoom } = useBattlefieldCtx()
  const isDragging = useRef(false)

  if (!visible) return null

  const r = radius + 10
  const filled = arcPath(intrinsicImpact, cx, cy, r)
  const bg = arcBackgroundPath(cx, cy, r)
  const handle = arcHandlePos(intrinsicImpact, cx, cy, r)

  function onHandlePointerDown(e: React.PointerEvent) {
    e.stopPropagation()
    isDragging.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onHandlePointerMove(e: React.PointerEvent) {
    if (!isDragging.current) return
    e.stopPropagation()
    // Get pointer position relative to SVG center (cx, cy are SVG coords)
    const svgEl = (e.currentTarget as SVGCircleElement).ownerSVGElement
    if (!svgEl) return
    const rect = svgEl.getBoundingClientRect()
    // SVG coords = world coords, but SVG is scaled by zoom
    const svgX = (e.clientX - rect.left) / zoom
    const svgY = (e.clientY - rect.top) / zoom
    const dx = svgX - cx
    const dy = svgY - cy
    onUpdate(angleToIntrinsicImpact(dx, dy))
  }

  function onHandlePointerUp() {
    isDragging.current = false
  }

  return (
    <g>
      {/* Background arc */}
      <path d={bg} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} strokeLinecap="round" />
      {/* Filled arc */}
      {filled && (
        <path d={filled} fill="none" stroke="#e8a045" strokeWidth={3} strokeLinecap="round" strokeOpacity={0.7} />
      )}
      {/* Drag handle */}
      <circle
        cx={handle.x}
        cy={handle.y}
        r={5}
        fill="#e8a045"
        fillOpacity={0.9}
        style={{ cursor: 'ew-resize' }}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
      />
    </g>
  )
}
