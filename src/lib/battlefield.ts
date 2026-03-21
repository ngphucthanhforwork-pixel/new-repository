// Pure utility functions for the Battlefield canvas

// Piece size: 48px base, scales with cumulative score up to 112px
export function pieceSize(cumulativeScore: number): number {
  return Math.round(48 + Math.min(cumulativeScore, 1) * 64)
}

// Default position for a piece if no position is stored yet
export function defaultPosition(index: number): { x: number; y: number } {
  const col = index % 4
  const row = Math.floor(index / 4)
  return { x: 160 + col * 220, y: 160 + row * 220 }
}

// ─── Arc Ring ────────────────────────────────────────────────────────────────

const ARC_START_DEG = 135   // bottom-left
const ARC_SWEEP_DEG = 270   // clockwise sweep to bottom-right

function toRad(deg: number) { return deg * Math.PI / 180 }

// SVG path for the filled portion of the arc
export function arcPath(intrinsicImpact: number, cx: number, cy: number, r: number): string {
  const sweep = ARC_SWEEP_DEG * Math.max(0, Math.min(1, intrinsicImpact))
  if (sweep < 1) return ''
  const startX = cx + r * Math.cos(toRad(ARC_START_DEG))
  const startY = cy + r * Math.sin(toRad(ARC_START_DEG))
  const endDeg = ARC_START_DEG + sweep
  const endX = cx + r * Math.cos(toRad(endDeg))
  const endY = cy + r * Math.sin(toRad(endDeg))
  const largeArc = sweep > 180 ? 1 : 0
  return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`
}

// SVG path for the full background arc (always 270°)
export function arcBackgroundPath(cx: number, cy: number, r: number): string {
  const startX = cx + r * Math.cos(toRad(ARC_START_DEG))
  const startY = cy + r * Math.sin(toRad(ARC_START_DEG))
  const endDeg = ARC_START_DEG + ARC_SWEEP_DEG - 0.01 // avoid full-circle rendering issue
  const endX = cx + r * Math.cos(toRad(endDeg))
  const endY = cy + r * Math.sin(toRad(endDeg))
  return `M ${startX} ${startY} A ${r} ${r} 0 1 1 ${endX} ${endY}`
}

// Position of the draggable handle at the end of the filled arc
export function arcHandlePos(intrinsicImpact: number, cx: number, cy: number, r: number) {
  const deg = ARC_START_DEG + ARC_SWEEP_DEG * Math.max(0, Math.min(1, intrinsicImpact))
  return { x: cx + r * Math.cos(toRad(deg)), y: cy + r * Math.sin(toRad(deg)) }
}

// Convert pointer offset (dx, dy) from piece center → intrinsic_impact 0–1
export function angleToIntrinsicImpact(dx: number, dy: number): number {
  let angle = Math.atan2(dy, dx) * 180 / Math.PI
  if (angle < 0) angle += 360
  let relative = angle - ARC_START_DEG
  if (relative < 0) relative += 360
  return Math.max(0, Math.min(1, relative / ARC_SWEEP_DEG))
}

// ─── Arrows ──────────────────────────────────────────────────────────────────

// Bezier curve path from child piece center to parent piece center
export function arrowPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`
}
