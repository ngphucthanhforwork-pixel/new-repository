import { useRef } from 'react'

// ─── Arc math (top semicircle, left→right = 0→1) ───────────────────────────

const CX = 90
const CY = 100
const R_OUTER = 84   // Certainty (amber)
const R_INNER = 62   // Intrinsic Impact (teal)

function arcPos(v: number, r: number) {
  const angle = Math.PI * (1 - v)  // π at v=0 (left), 0 at v=1 (right)
  return {
    x: CX + r * Math.cos(angle),
    y: CY - r * Math.sin(angle),  // negate: SVG y goes down, math y goes up
  }
}

function filledArcPath(v: number, r: number): string {
  if (v <= 0.001) return ''
  if (v >= 0.999) {
    // Full semicircle as two quarter-arcs to avoid degenerate case
    return `M ${CX - r} ${CY} A ${r} ${r} 0 0 0 ${CX} ${CY - r} A ${r} ${r} 0 0 0 ${CX + r} ${CY}`
  }
  const { x, y } = arcPos(v, r)
  return `M ${CX - r} ${CY} A ${r} ${r} 0 0 0 ${x} ${y}`
}

function bgArcPath(r: number): string {
  return `M ${CX - r} ${CY} A ${r} ${r} 0 0 0 ${CX} ${CY - r} A ${r} ${r} 0 0 0 ${CX + r} ${CY}`
}

function svgCoordsToValue(
  clientX: number,
  clientY: number,
  svgEl: SVGSVGElement,
): number {
  const rect = svgEl.getBoundingClientRect()
  const svgX = (clientX - rect.left) * (180 / rect.width)
  const svgY = (clientY - rect.top) * (110 / rect.height)
  const dx = svgX - CX
  const dy = CY - svgY  // flip y
  let angle = Math.atan2(dy, dx)  // standard math angle ∈ (−π, π]
  // Below the center: snap to nearest end
  if (angle <= 0) return dx <= 0 ? 0 : 1
  // v = 1 − angle/π
  return Math.max(0, Math.min(1, 1 - angle / Math.PI))
}

// ─── Component ──────────────────────────────────────────────────────────────

interface DualArcSliderProps {
  certainty: number
  impact: number
  onCertaintyChange: (v: number) => void
  onImpactChange: (v: number) => void
}

export function DualArcSlider({ certainty, impact, onCertaintyChange, onImpactChange }: DualArcSliderProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragTarget = useRef<'certainty' | 'impact' | null>(null)

  const certaintyHandle = arcPos(certainty, R_OUTER)
  const impactHandle = arcPos(impact, R_INNER)

  function onPointerDown(target: 'certainty' | 'impact') {
    return (e: React.PointerEvent<SVGCircleElement>) => {
      e.stopPropagation()
      dragTarget.current = target
      ;(e.currentTarget as SVGCircleElement).setPointerCapture(e.pointerId)
    }
  }

  function onPointerMove(e: React.PointerEvent<SVGCircleElement>) {
    if (!dragTarget.current || !svgRef.current) return
    const v = svgCoordsToValue(e.clientX, e.clientY, svgRef.current)
    if (dragTarget.current === 'certainty') onCertaintyChange(v)
    else onImpactChange(v)
  }

  function onPointerUp() {
    dragTarget.current = null
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        ref={svgRef}
        viewBox="0 0 180 110"
        style={{ width: 160, height: 98, display: 'block', overflow: 'visible' }}
      >
        {/* Outer arc — Certainty (amber) */}
        <path d={bgArcPath(R_OUTER)} fill="none" stroke="rgba(232,160,69,0.1)" strokeWidth={5} strokeLinecap="round" />
        {filledArcPath(certainty, R_OUTER) && (
          <path d={filledArcPath(certainty, R_OUTER)} fill="none" stroke="#e8a045" strokeWidth={5} strokeLinecap="round" strokeOpacity={0.75} />
        )}
        <circle
          cx={certaintyHandle.x}
          cy={certaintyHandle.y}
          r={7}
          fill="#e8a045"
          fillOpacity={0.9}
          stroke="#070c14"
          strokeWidth={2}
          style={{ cursor: 'ew-resize' }}
          onPointerDown={onPointerDown('certainty')}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />

        {/* Inner arc — Intrinsic Impact (teal) */}
        <path d={bgArcPath(R_INNER)} fill="none" stroke="rgba(74,184,176,0.1)" strokeWidth={5} strokeLinecap="round" />
        {filledArcPath(impact, R_INNER) && (
          <path d={filledArcPath(impact, R_INNER)} fill="none" stroke="#4ab8b0" strokeWidth={5} strokeLinecap="round" strokeOpacity={0.75} />
        )}
        <circle
          cx={impactHandle.x}
          cy={impactHandle.y}
          r={7}
          fill="#4ab8b0"
          fillOpacity={0.9}
          stroke="#070c14"
          strokeWidth={2}
          style={{ cursor: 'ew-resize' }}
          onPointerDown={onPointerDown('impact')}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />

        {/* Center value labels */}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize={13} fontFamily="IBM Plex Mono, monospace" fill="rgba(232,160,69,0.9)" fontWeight="600">
          {Math.round(certainty * 100)}
        </text>
        <text x={CX} y={CY + 8} textAnchor="middle" fontSize={10} fontFamily="IBM Plex Mono, monospace" fill="rgba(74,184,176,0.7)">
          {Math.round(impact * 100)}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#e8a045' }} />
          <span className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(232,160,69,0.6)' }}>CERTAINTY</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#4ab8b0' }} />
          <span className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(74,184,176,0.6)' }}>IMPACT</span>
        </div>
      </div>
    </div>
  )
}
