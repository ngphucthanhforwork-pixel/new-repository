import { useRef } from 'react'

// ─── Quarter-circle arcs anchored at bottom-left corner ─────────────────────
// Center (CX, CY) is the pivot; arcs sweep from 3-o'clock → 12-o'clock

const CX = 6    // pivot x (near left edge)
const CY = 92   // pivot y (near bottom)
const R_OUTER = 82  // Certainty (amber) — right: (88, 92), top: (6, 10)
const R_INNER = 60  // Intrinsic Impact (teal) — right: (66, 92), top: (6, 32)

function arcPos(v: number, r: number) {
  const angle = v * (Math.PI / 2)  // 0 → 0° (right), 1 → 90° (up)
  return {
    x: CX + r * Math.cos(angle),
    y: CY - r * Math.sin(angle),  // SVG y inverted
  }
}

// Counter-clockwise in SVG (sweep=0) goes from right UP to top — the short 90° path ✓
function quarterFillPath(v: number, r: number): string {
  if (v <= 0.001) return ''
  if (v >= 0.999) return `M ${CX + r} ${CY} A ${r} ${r} 0 0 0 ${CX} ${CY - r}`
  const { x, y } = arcPos(v, r)
  return `M ${CX + r} ${CY} A ${r} ${r} 0 0 0 ${x} ${y}`
}

function quarterBgPath(r: number): string {
  return `M ${CX + r} ${CY} A ${r} ${r} 0 0 0 ${CX} ${CY - r}`
}

function svgCoordsToValue(clientX: number, clientY: number, svgEl: SVGSVGElement): number {
  const rect = svgEl.getBoundingClientRect()
  const svgX = (clientX - rect.left) * (100 / rect.width)
  const svgY = (clientY - rect.top) * (100 / rect.height)
  const dx = svgX - CX
  const dy = CY - svgY  // flip: math y goes up
  if (dy <= 0) return 0
  if (dx <= 0) return 1
  const angle = Math.atan2(dy, dx)  // 0 to π/2 for first quadrant
  return Math.max(0, Math.min(1, angle / (Math.PI / 2)))
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
        viewBox="0 0 100 100"
        style={{ width: 130, height: 130, display: 'block', overflow: 'visible' }}
      >
        {/* Outer arc — Certainty (amber) */}
        <path d={quarterBgPath(R_OUTER)} fill="none" stroke="rgba(232,160,69,0.1)" strokeWidth={5} strokeLinecap="round" />
        {quarterFillPath(certainty, R_OUTER) && (
          <path d={quarterFillPath(certainty, R_OUTER)} fill="none" stroke="#e8a045" strokeWidth={5} strokeLinecap="round" strokeOpacity={0.8} />
        )}
        <circle
          cx={certaintyHandle.x}
          cy={certaintyHandle.y}
          r={7}
          fill="#e8a045"
          fillOpacity={0.9}
          stroke="#070c14"
          strokeWidth={2}
          style={{ cursor: 'pointer' }}
          onPointerDown={onPointerDown('certainty')}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />

        {/* Inner arc — Intrinsic Impact (teal) */}
        <path d={quarterBgPath(R_INNER)} fill="none" stroke="rgba(74,184,176,0.1)" strokeWidth={5} strokeLinecap="round" />
        {quarterFillPath(impact, R_INNER) && (
          <path d={quarterFillPath(impact, R_INNER)} fill="none" stroke="#4ab8b0" strokeWidth={5} strokeLinecap="round" strokeOpacity={0.8} />
        )}
        <circle
          cx={impactHandle.x}
          cy={impactHandle.y}
          r={7}
          fill="#4ab8b0"
          fillOpacity={0.9}
          stroke="#070c14"
          strokeWidth={2}
          style={{ cursor: 'pointer' }}
          onPointerDown={onPointerDown('impact')}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />

        {/* Value labels near the corner */}
        <text x={CX + 8} y={CY - 10} textAnchor="start" fontSize={12} fontFamily="IBM Plex Mono, monospace" fill="rgba(232,160,69,0.9)" fontWeight="600">
          {Math.round(certainty * 100)}
        </text>
        <text x={CX + 8} y={CY + 4} textAnchor="start" fontSize={10} fontFamily="IBM Plex Mono, monospace" fill="rgba(74,184,176,0.7)">
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
